package main

import (
	"log"
	"net/http"

	"expo-truecaller-example-server/core"
	"expo-truecaller-example-server/router"
)

func main() {
	cfg, err := core.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Using Truecaller token endpoint: %s", cfg.TokenURL)

	mux := router.SetupRoutes(cfg)

	addr := ":" + cfg.Port
	log.Printf("expo-truecaller example server listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
