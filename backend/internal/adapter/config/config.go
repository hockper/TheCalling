// Package config manages configuration for the application.
package config

import (
	"fmt"
	"os"
)

// Config holds the configuration values for the application.
type Config struct {
	Port        string
	DatabaseURL string
	RedisURL    string
	JWTSecret   string
	Env         string
}

// Load reads the configuration from environment variables.
func Load() (*Config, error) {
	port := getEnv("PORT", "8080")
	dbURL := os.Getenv("DATABASE_URL")
	redisURL := os.Getenv("REDIS_URL")
	jwtSecret := os.Getenv("JWT_SECRET")
	env := getEnv("ENV", "development")

	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if redisURL == "" {
		return nil, fmt.Errorf("REDIS_URL is required")
	}
	if jwtSecret == "" && env == "production" {
		return nil, fmt.Errorf("JWT_SECRET is required in production")
	}
	if jwtSecret == "" {
		jwtSecret = "default-development-secret-key"
	}

	return &Config{
		Port:        port,
		DatabaseURL: dbURL,
		RedisURL:    redisURL,
		JWTSecret:   jwtSecret,
		Env:         env,
	}, nil
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}
