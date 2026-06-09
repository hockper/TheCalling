// Package config manages configuration for the application.
package config

import (
	"os"
	"testing"
)

func TestLoad_MissingDatabaseURL(t *testing.T) {
	// Arrange - DATABASE_URL not set
	os.Clearenv()
	_ = os.Setenv("REDIS_URL", "redis://localhost:6379")
	_ = os.Setenv("JWT_SECRET", "secret")

	// Act
	_, err := Load()

	// Assert
	if err == nil {
		t.Error("expected error due to missing DATABASE_URL, got nil")
	}
}

func TestLoad_MissingRedisURL(t *testing.T) {
	// Arrange - REDIS_URL not set
	os.Clearenv()
	_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432")
	_ = os.Setenv("JWT_SECRET", "secret")

	// Act
	_, err := Load()

	// Assert
	if err == nil {
		t.Error("expected error due to missing REDIS_URL, got nil")
	}
}

func TestLoad_MissingJWTSecretInProduction(t *testing.T) {
	// Arrange - JWT_SECRET not set, ENV=production should require it
	os.Clearenv()
	_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432")
	_ = os.Setenv("REDIS_URL", "redis://localhost:6379")
	_ = os.Setenv("ENV", "production")

	// Act
	_, err := Load()

	// Assert
	if err == nil {
		t.Error("expected error due to missing JWT_SECRET in production, got nil")
	}
}

func TestLoad_DefaultJWTSecretInDevelopment(t *testing.T) {
	// Arrange - JWT_SECRET not set, ENV=development should use a default key
	os.Clearenv()
	_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432")
	_ = os.Setenv("REDIS_URL", "redis://localhost:6379")
	_ = os.Setenv("ENV", "development")

	// Act
	cfg, err := Load()

	// Assert
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.JWTSecret != "default-development-secret-key" {
		t.Errorf("expected default dev secret, got %s", cfg.JWTSecret)
	}
}

func TestLoad_DefaultPortAndEnv(t *testing.T) {
	// Arrange - PORT and ENV not set, defaults should apply
	os.Clearenv()
	_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432")
	_ = os.Setenv("REDIS_URL", "redis://localhost:6379")
	_ = os.Setenv("JWT_SECRET", "secret")

	// Act
	cfg, err := Load()

	// Assert
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Port != "8080" {
		t.Errorf("expected default PORT=8080, got %s", cfg.Port)
	}
	if cfg.Env != "development" {
		t.Errorf("expected default ENV=development, got %s", cfg.Env)
	}
}

func TestLoad_Success(t *testing.T) {
	// Arrange - all values provided explicitly
	os.Clearenv()
	_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432")
	_ = os.Setenv("REDIS_URL", "redis://localhost:6379")
	_ = os.Setenv("JWT_SECRET", "test-secret")
	_ = os.Setenv("PORT", "9090")
	_ = os.Setenv("ENV", "staging")

	// Act
	cfg, err := Load()

	// Assert
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.DatabaseURL != "postgres://localhost:5432" {
		t.Errorf("expected DATABASE_URL to match, got %s", cfg.DatabaseURL)
	}
	if cfg.Port != "9090" {
		t.Errorf("expected PORT=9090, got %s", cfg.Port)
	}
	if cfg.JWTSecret != "test-secret" {
		t.Errorf("expected JWT_SECRET=test-secret, got %s", cfg.JWTSecret)
	}
}

func TestGetEnv_ReturnsSetValue(t *testing.T) {
	// Arrange
	_ = os.Setenv("TEST_GETENV_SET", "hello-world")

	// Act
	result := getEnv("TEST_GETENV_SET", "fallback")

	// Assert
	if result != "hello-world" {
		t.Errorf("expected 'hello-world', got '%s'", result)
	}
}

func TestGetEnv_ReturnsDefaultWhenUnset(t *testing.T) {
	// Arrange - ensure key is not set
	os.Unsetenv("TEST_GETENV_UNSET_KEY_XYZ")

	// Act
	result := getEnv("TEST_GETENV_UNSET_KEY_XYZ", "my-fallback")

	// Assert
	if result != "my-fallback" {
		t.Errorf("expected 'my-fallback', got '%s'", result)
	}
}
