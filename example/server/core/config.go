package core

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	TokenURL           string
	TrueCallerClientID string
	Issuer             string
	JWKSURL            string
}

const defaultTruecallerTokenURL = "https://oauth-account-noneu.truecaller.com/v1/token"

const defaultTruecallerIssuer = "https://oauth-account-noneu.truecaller.com"

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		return nil, err
	}

	port := envOrDefault("PORT", "8080")
	tokenURL := envOrDefault("TRUECALLER_TOKEN_URL", defaultTruecallerTokenURL)
	trueCallerClientID := envOrDefault("TRUECALLER_CLIENT_ID", "")

	issuer := envOrDefault("TRUECALLER_ISSUER", defaultTruecallerIssuer)
	jwksURL := envOrDefault("TRUECALLER_JWKS_URL", issuer+"/.well-known/"+trueCallerClientID+"/jwks.json")

	return &Config{
		Issuer:             issuer,
		JWKSURL:            jwksURL,
		Port:               port,
		TokenURL:           tokenURL,
		TrueCallerClientID: trueCallerClientID,
	}, nil
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
