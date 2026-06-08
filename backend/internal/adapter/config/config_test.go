package config

import (
	"os"
	"testing"
)

func TestLoad_MissingDB(t *testing.T) {
	os.Clearenv()
	_ = os.Setenv("REDIS_URL", "redis://localhost:6379")

	_, err := Load()
	if err == nil {
		t.Error("expected error due to missing DATABASE_URL, got nil")
	}
}

func TestLoad_MissingRedis(t *testing.T) {
	os.Clearenv()
	_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432")

	_, err := Load()
	if err == nil {
		t.Error("expected error due to missing REDIS_URL, got nil")
	}
}

func TestLoad_Success(t *testing.T) {
	os.Clearenv()
	_ = os.Setenv("DATABASE_URL", "postgres://localhost:5432")
	_ = os.Setenv("REDIS_URL", "redis://localhost:6379")
	_ = os.Setenv("JWT_SECRET", "test-secret")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.DatabaseURL != "postgres://localhost:5432" {
		t.Errorf("expected DATABASE_URL to match, got %s", cfg.DatabaseURL)
	}
}
