// Package http provides HTTP handlers and routers.
package http

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/redis/go-redis/v9"
)

// HealthHandler responds to health check requests.
type HealthHandler struct {
	db  *sql.DB
	rdb *redis.Client
}

// NewHealthHandler creates a new HealthHandler.
func NewHealthHandler(db *sql.DB, rdb *redis.Client) *HealthHandler {
	return &HealthHandler{db: db, rdb: rdb}
}

// HealthResponse represents the health check response body.
type HealthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
	Redis    string `json:"redis"`
}

func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	dbStatus := "connected"
	if h.db == nil || h.db.Ping() != nil {
		dbStatus = "disconnected"
	}

	redisStatus := "connected"
	if h.rdb == nil || h.rdb.Ping(r.Context()).Err() != nil {
		redisStatus = "disconnected"
	}

	status := "ok"
	statusCode := http.StatusOK
	if dbStatus != "connected" || redisStatus != "connected" {
		status = "error"
		statusCode = http.StatusServiceUnavailable
	}

	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(HealthResponse{
		Status:   status,
		Database: dbStatus,
		Redis:    redisStatus,
	})
}
