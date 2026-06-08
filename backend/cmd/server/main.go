package main

import (
	"log"
	"net/http"
	"time"

	"backend/internal/adapter/cache"
	"backend/internal/adapter/config"
	"backend/internal/adapter/db"
	adapterhttp "backend/internal/adapter/http"
	"backend/internal/middleware"
	"backend/internal/request/delivery"
	"backend/internal/request/repository"
	"backend/internal/request/usecase"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	database, err := db.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer func() { _ = database.Close() }() //nolint:errcheck

	redisClient, err := cache.InitRedis(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer func() { _ = redisClient.Close() }() //nolint:errcheck

	// Initialize repositories
	requestRepo := repository.NewPostgresRequestRepository(database)
	userRepo := repository.NewPostgresUserRepository(database)

	// Initialize usecases
	requestUC := usecase.NewRequestUsecase(requestRepo, userRepo)

	// Initialize handlers
	userHandler := adapterhttp.NewUserHandler(cfg.JWTSecret, database)
	requestHandler := delivery.NewRequestHandler(requestUC)

	// Auth middleware
	authMW := middleware.AuthMiddleware([]byte(cfg.JWTSecret))

	// Setup routes
	mux := http.NewServeMux()

	// Health check (no auth required)
	mux.Handle("/health", adapterhttp.NewHealthHandler(database, redisClient))

	// Auth endpoints (no auth middleware)
	mux.HandleFunc("/api/auth/login", userHandler.Login)
	mux.HandleFunc("/api/auth/logout", userHandler.Logout)

	// User endpoints (auth required - handled internally via cookie parsing)
	mux.HandleFunc("/api/users/me", userHandler.Me)
	mux.Handle("/api/users", authMW(http.HandlerFunc(userHandler.ListUsers)))

	// Request endpoints (auth required via middleware)
	mux.Handle("/api/requests", authMW(http.HandlerFunc(requestHandler.HandleRequests)))
	mux.Handle("/api/requests/", authMW(http.HandlerFunc(requestHandler.HandleRequestByID)))

	log.Printf("Server starting on port %s in %s mode", cfg.Port, cfg.Env)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           mux,
		ReadHeaderTimeout: 3 * time.Second,
	}
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
