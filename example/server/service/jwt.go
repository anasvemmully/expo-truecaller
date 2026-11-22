package service

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"
)

const clockSkew = 60 * time.Second

// Verifier checks Truecaller id_tokens: RS256 signature against the client's
// JWKS, plus the iss, aud, exp and nbf claims. Standard library only.
type Verifier struct {
	jwksURL  string
	issuer   string
	clientID string
	client   *http.Client
	now      func() time.Time

	mu   sync.Mutex
	keys map[string]*rsa.PublicKey
}

func NewVerifier(jwksURL, issuer, clientID string) *Verifier {
	return &Verifier{
		jwksURL:  jwksURL,
		issuer:   issuer,
		clientID: clientID,
		client:   &http.Client{Timeout: 10 * time.Second},
		now:      time.Now,
		keys:     map[string]*rsa.PublicKey{},
	}
}

// Verify returns the token's claims only if the signature and claims are valid.
func (v *Verifier) Verify(idToken string) (map[string]any, error) {
	parts := strings.Split(idToken, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("id_token is not a JWT (expected 3 dot-separated parts, got %d)", len(parts))
	}

	var header struct {
		Alg string `json:"alg"`
		Kid string `json:"kid"`
	}
	if err := decodeSegment(parts[0], &header); err != nil {
		return nil, fmt.Errorf("decoding JWT header: %w", err)
	}
	// Pin the algorithm: never let the token choose "none" or an HMAC variant.
	if header.Alg != "RS256" {
		return nil, fmt.Errorf("unsupported id_token alg %q (expected RS256)", header.Alg)
	}
	if header.Kid == "" {
		return nil, errors.New("id_token header has no kid")
	}

	key, err := v.keyFor(header.Kid)
	if err != nil {
		return nil, err
	}

	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, fmt.Errorf("decoding JWT signature: %w", err)
	}
	digest := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	if err := rsa.VerifyPKCS1v15(key, crypto.SHA256, digest[:], signature); err != nil {
		return nil, errors.New("id_token signature is invalid")
	}

	var claims map[string]any
	if err := decodeSegment(parts[1], &claims); err != nil {
		return nil, fmt.Errorf("parsing JWT payload: %w", err)
	}
	if err := v.checkClaims(claims); err != nil {
		return nil, err
	}
	return claims, nil
}

func (v *Verifier) checkClaims(claims map[string]any) error {
	if iss, _ := claims["iss"].(string); iss != v.issuer {
		return fmt.Errorf("id_token issuer %q does not match expected %q", iss, v.issuer)
	}
	if !audienceContains(claims["aud"], v.clientID) {
		return errors.New("id_token audience does not include this client ID")
	}

	now := v.now()
	exp, ok := claims["exp"].(float64)
	if !ok {
		return errors.New("id_token has no exp claim")
	}
	if now.After(time.Unix(int64(exp), 0).Add(clockSkew)) {
		return errors.New("id_token is expired")
	}
	if nbf, ok := claims["nbf"].(float64); ok && now.Add(clockSkew).Before(time.Unix(int64(nbf), 0)) {
		return errors.New("id_token is not valid yet")
	}
	return nil
}

func audienceContains(aud any, clientID string) bool {
	switch a := aud.(type) {
	case string:
		return a == clientID
	case []any:
		for _, item := range a {
			if s, ok := item.(string); ok && s == clientID {
				return true
			}
		}
	}
	return false
}

// keyFor returns the cached key for kid, refetching the JWKS once if unknown
// (covers key rotation).
func (v *Verifier) keyFor(kid string) (*rsa.PublicKey, error) {
	v.mu.Lock()
	defer v.mu.Unlock()

	if key, ok := v.keys[kid]; ok {
		return key, nil
	}
	if err := v.refreshLocked(); err != nil {
		return nil, err
	}
	key, ok := v.keys[kid]
	if !ok {
		return nil, fmt.Errorf("no signing key with kid %q in Truecaller JWKS", kid)
	}
	return key, nil
}

type jwks struct {
	Keys []struct {
		Kty string `json:"kty"`
		Kid string `json:"kid"`
		N   string `json:"n"`
		E   string `json:"e"`
	} `json:"keys"`
}

func (v *Verifier) refreshLocked() error {
	resp, err := v.client.Get(v.jwksURL)
	if err != nil {
		return fmt.Errorf("fetching Truecaller JWKS: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return err
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("JWKS endpoint returned %d: %s", resp.StatusCode, body)
	}

	var set jwks
	if err := json.Unmarshal(body, &set); err != nil {
		return fmt.Errorf("decoding JWKS: %w", err)
	}

	keys := map[string]*rsa.PublicKey{}
	for _, k := range set.Keys {
		if k.Kty != "RSA" {
			continue
		}
		n, err := base64.RawURLEncoding.DecodeString(k.N)
		if err != nil {
			continue
		}
		e, err := base64.RawURLEncoding.DecodeString(k.E)
		if err != nil || len(e) == 0 || len(e) > 4 {
			continue
		}
		exp := 0
		for _, b := range e {
			exp = exp<<8 | int(b)
		}
		keys[k.Kid] = &rsa.PublicKey{N: new(big.Int).SetBytes(n), E: exp}
	}
	v.keys = keys
	return nil
}

func decodeSegment(segment string, out any) error {
	raw, err := base64.RawURLEncoding.DecodeString(segment)
	if err != nil {
		return err
	}
	return json.Unmarshal(raw, out)
}
