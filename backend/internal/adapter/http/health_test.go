package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
)

func TestHealthHandler_AllScenarios(t *testing.T) {
	t.Run("should return ok when both DB and Redis are connected", func(t *testing.T) {
		// Arrange: mock SQL DB
		db, mock, err := sqlmock.New(sqlmock.MonitorPingsOption(true))
		assert.NoError(t, err)
		defer func() { _ = db.Close() }()
		mock.ExpectPing()

		// Arrange: mock Redis
		mr, err := miniredis.Run()
		assert.NoError(t, err)
		defer mr.Close()
		rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
		defer func() { _ = rdb.Close() }()

		handler := NewHealthHandler(db, rdb)
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rec := httptest.NewRecorder()

		// Act
		handler.ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
		var resp HealthResponse
		err = json.Unmarshal(rec.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, "ok", resp.Status)
		assert.Equal(t, "connected", resp.Database)
		assert.Equal(t, "connected", resp.Redis)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return error when DB is disconnected and Redis is connected", func(t *testing.T) {
		// Arrange: closed/nil SQL DB
		db, mock, err := sqlmock.New(sqlmock.MonitorPingsOption(true))
		assert.NoError(t, err)
		_ = db.Close() // close it immediately to cause ping failure

		// Arrange: mock Redis
		mr, err := miniredis.Run()
		assert.NoError(t, err)
		defer mr.Close()
		rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
		defer func() { _ = rdb.Close() }()

		handler := NewHealthHandler(db, rdb)
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rec := httptest.NewRecorder()

		// Act
		handler.ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusServiceUnavailable, rec.Code)
		var resp HealthResponse
		err = json.Unmarshal(rec.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, "error", resp.Status)
		assert.Equal(t, "disconnected", resp.Database)
		assert.Equal(t, "connected", resp.Redis)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return error when DB is connected and Redis is disconnected", func(t *testing.T) {
		// Arrange: mock SQL DB
		db, mock, err := sqlmock.New(sqlmock.MonitorPingsOption(true))
		assert.NoError(t, err)
		defer func() { _ = db.Close() }()
		mock.ExpectPing()

		// Arrange: disconnected Redis client
		rdb := redis.NewClient(&redis.Options{Addr: "localhost:63799"}) // bad address
		defer func() { _ = rdb.Close() }()

		handler := NewHealthHandler(db, rdb)
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rec := httptest.NewRecorder()

		// Act
		handler.ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusServiceUnavailable, rec.Code)
		var resp HealthResponse
		err = json.Unmarshal(rec.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, "error", resp.Status)
		assert.Equal(t, "connected", resp.Database)
		assert.Equal(t, "disconnected", resp.Redis)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return error when both are disconnected", func(t *testing.T) {
		// Arrange: both nil
		handler := NewHealthHandler(nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rec := httptest.NewRecorder()

		// Act
		handler.ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusServiceUnavailable, rec.Code)
		var resp HealthResponse
		err := json.Unmarshal(rec.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, "error", resp.Status)
		assert.Equal(t, "disconnected", resp.Database)
		assert.Equal(t, "disconnected", resp.Redis)
	})
}
