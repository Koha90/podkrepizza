package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/koha90/podkrepizza/internal/database"
	"github.com/koha90/podkrepizza/internal/server"
	"github.com/koha90/podkrepizza/pkg/logger"

	"github.com/koha90/podkrepizza/internal/config"
)

func gracefulShutdown(apiServer *http.Server, done chan bool, ctx context.Context) {
	// Listen for the interrupt signal.
	<-ctx.Done()

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := apiServer.Shutdown(ctxTimeout); err != nil {
		log.Printf("Server forced to shutdown with error: %v", err)
	}

	// Notify the main goroutine that the shutdown is complete
	done <- true
}

func main() {
	// Загружаем конффигаруционный файл и устанавливаем логгер из настройки.
	cfg := config.MustLoad()
	log := logger.SetupLogger(cfg.Logger.Env)

	port := strconv.Itoa(cfg.Store.Port)
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable&search_path=%s",
		cfg.Store.Username,
		cfg.Store.Password,
		cfg.Store.Host,
		port,
		cfg.Store.Database,
		cfg.Store.Shema,
	)

	log.Debug("debug mode enabled")

	db := database.New(dsn)

	server := server.NewServer(db, cfg)

	// Create a done channel to signal when the shutdown is complete
	done := make(chan bool, 1)

	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Run graceful shutdown in a separate goroutine
	go gracefulShutdown(server, done, ctx)

	err := server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}

	// Wait for the graceful shutdown to complete
	<-done
	log.Info("Graceful shutdown complete.")
}
