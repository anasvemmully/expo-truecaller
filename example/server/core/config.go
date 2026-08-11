package core

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	TokenURL           string
	TrueCallerClientID string
}

const defaultTruecallerTokenURL = "https://oauth-account-noneu.truecaller.com/v1/token"

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		return nil, err
	}

	port := envOrDefault("PORT", "8080")
	tokenURL := envOrDefault("TRUECALLER_TOKEN_URL", defaultTruecallerTokenURL)
	trueCallerClientID := envOrDefault("TRUECALLER_CLIENT_ID", "")

	return &Config{
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
