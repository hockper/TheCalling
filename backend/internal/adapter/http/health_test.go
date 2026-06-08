package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthHandler_Offline(t *testing.T) {
	// Nil db and redis should report disconnected
	handler := NewHealthHandler(nil, nil)

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("expected status 503, got %d", w.Code)
	}

	var resp HealthResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Status != "error" {
		t.Errorf("expected status 'error', got '%s'", resp.Status)
	}
	if resp.Database != "disconnected" {
		t.Errorf("expected database 'disconnected', got '%s'", resp.Database)
	}
	if resp.Redis != "disconnected" {
		t.Errorf("expected redis 'disconnected', got '%s'", resp.Redis)
	}
}
