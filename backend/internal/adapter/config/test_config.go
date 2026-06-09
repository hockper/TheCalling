// Package config manages configuration for the application.
package config

import (
	"os"
)

// LoadTestConfig loads the configuration for tests. It defaults missing variables
// to sensible test fallbacks instead of failing, allowing unit tests to run smoothly.
func LoadTestConfig() *Config {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/thecalling_test?sslmode=disable"
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379/1"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "test-secret-key-that-is-at-least-thirty-two-bytes-long"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "test"
	}

	return &Config{
		Port:        port,
		DatabaseURL: dbURL,
		RedisURL:    redisURL,
		JWTSecret:   jwtSecret,
		Env:         env,
	}
}
