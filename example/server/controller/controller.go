package controller

import (
	"encoding/json"
	"log"
	"net/http"

	"expo-truecaller-example-server/core"
	"expo-truecaller-example-server/httpx"
	"expo-truecaller-example-server/service"
)

type exchangeRequest struct {
	AuthorizationCode string `json:"authorizationCode"`
	CodeVerifier      string `json:"codeVerifier"`
}

func HandleExchange(cfg *core.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req exchangeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}

		if req.AuthorizationCode == "" || req.CodeVerifier == "" {
			httpx.WriteJSON(w, http.StatusBadRequest, map[string]string{
				"error": "authorizationCode and codeVerifier are both required",
			})
			return
		}

		profile, err := service.ExchangeCodeForToken(cfg, req.AuthorizationCode, req.CodeVerifier)
		if err != nil {
			log.Printf("token exchange failed: %v", err)
			httpx.WriteJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
			return
		}

		httpx.WriteJSON(w, http.StatusOK, map[string]any{"profile": profile})
	}
}
