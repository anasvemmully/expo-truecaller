package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"expo-truecaller-example-server/core"
)

type tokenResponse struct {
	AccessToken string `json:"access_token"`
	IDToken     string `json:"id_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Scope       string `json:"scope"`
}

func ExchangeCodeForToken(cfg *core.Config, authorizationCode, codeVerifier string) (map[string]any, error) {
	token, err := exchangeCodeForToken(cfg, authorizationCode, codeVerifier)
	if err != nil {
		return nil, err
	}

	if token.IDToken == "" {
		return nil, fmt.Errorf("token response had no id_token to decode profile claims from")
	}

	return verifierFor(cfg).Verify(token.IDToken)
}

var (
	verifierOnce sync.Once
	verifier     *Verifier
)

func verifierFor(cfg *core.Config) *Verifier {
	verifierOnce.Do(func() {
		verifier = NewVerifier(cfg.JWKSURL, cfg.Issuer, cfg.TrueCallerClientID)
	})
	return verifier
}

func exchangeCodeForToken(cfg *core.Config, authorizationCode, codeVerifier string) (*tokenResponse, error) {
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", authorizationCode)
	form.Set("code_verifier", codeVerifier)
	form.Set("client_id", cfg.TrueCallerClientID)

	req, err := http.NewRequest(http.MethodPost, cfg.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("calling Truecaller token endpoint: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token endpoint returned %d: %s", resp.StatusCode, body)
	}

	var token tokenResponse
	if err := json.Unmarshal(body, &token); err != nil {
		return nil, fmt.Errorf("decoding token response: %w", err)
	}
	return &token, nil
}
