package server

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/koha90/podkrepizza/internal/config"
	"github.com/koha90/podkrepizza/internal/database"

	"github.com/koha90/podkrepizza/pkg/logger"

	_ "github.com/joho/godotenv/autoload"
)

type Server struct {
	port int

	log *slog.Logger
	db  database.Service
}

func NewServer(db database.Service, cfg *config.Config) *http.Server {
	port := cfg.HTTP.Port
	log := logger.SetupLogger(cfg.Logger.Env)
	NewServer := &Server{
		port: port,

		log: log,
		db:  db,
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  cfg.HTTP.IdleTimeout,
		ReadTimeout:  cfg.HTTP.ReadTimeout,
		WriteTimeout: cfg.HTTP.WriteTimeout,
	}

	return server
}
