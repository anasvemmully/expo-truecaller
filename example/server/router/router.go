package router

import (
	"net/http"

	"expo-truecaller-example-server/controller"
	"expo-truecaller-example-server/core"
)

func SetupRoutes(cfg *core.Config) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /auth/truecaller/exchange", controller.HandleExchange(cfg))

	return mux
}
