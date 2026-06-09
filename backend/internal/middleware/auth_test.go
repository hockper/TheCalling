package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

var testSecret = []byte("test-jwt-secret-key-that-is-at-least-32-bytes")

func generateTestToken(sub, email, role string, expiry time.Duration) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   sub,
		"email": email,
		"role":  role,
		"exp":   time.Now().Add(expiry).Unix(),
	})
	tokenString, _ := token.SignedString(testSecret)
	return tokenString
}

func TestAuthMiddleware(t *testing.T) {
	// Setup the test handler
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		role := GetUserRole(r.Context())
		email := GetUserEmail(r.Context())

		writeJSON(w, http.StatusOK, map[string]string{
			"user_id": userID,
			"role":    role,
			"email":   email,
		})
	})

	t.Run("should authorize request with valid token", func(t *testing.T) {
		// Arrange
		token := generateTestToken("12345", "user@test.com", "requester", time.Hour)
		req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: token})
		rec := httptest.NewRecorder()

		// Act
		AuthMiddleware(testSecret)(testHandler).ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
		var resp map[string]string
		err := json.NewDecoder(rec.Body).Decode(&resp)
		assert.NoError(t, err)
		assert.Equal(t, "12345", resp["user_id"])
		assert.Equal(t, "requester", resp["role"])
		assert.Equal(t, "user@test.com", resp["email"])
	})

	t.Run("should fail when token is missing", func(t *testing.T) {
		// Arrange
		req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
		rec := httptest.NewRecorder()

		// Act
		AuthMiddleware(testSecret)(testHandler).ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Contains(t, rec.Body.String(), "missing token")
	})

	t.Run("should fail when token is invalid", func(t *testing.T) {
		// Arrange
		req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: "invalid-token-string"})
		rec := httptest.NewRecorder()

		// Act
		AuthMiddleware(testSecret)(testHandler).ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Contains(t, rec.Body.String(), "invalid token")
	})

	t.Run("should fail when token is expired", func(t *testing.T) {
		// Arrange
		token := generateTestToken("12345", "user@test.com", "requester", -time.Hour)
		req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: token})
		rec := httptest.NewRecorder()

		// Act
		AuthMiddleware(testSecret)(testHandler).ServeHTTP(rec, req)

		// Assert
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Contains(t, rec.Body.String(), "invalid token")
	})
}

func TestRequireRole(t *testing.T) {
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	t.Run("should authorize when role matches", func(t *testing.T) {
		// Arrange
		req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
		ctx := context.WithValue(req.Context(), UserRoleKey, "handler")
		rec := httptest.NewRecorder()

		// Act
		RequireRole("handler")(testHandler).ServeHTTP(rec, req.WithContext(ctx))

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("should forbid when role does not match", func(t *testing.T) {
		// Arrange
		req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
		ctx := context.WithValue(req.Context(), UserRoleKey, "requester")
		rec := httptest.NewRecorder()

		// Act
		RequireRole("handler")(testHandler).ServeHTTP(rec, req.WithContext(ctx))

		// Assert
		assert.Equal(t, http.StatusForbidden, rec.Code)
		assert.Contains(t, rec.Body.String(), "insufficient permissions")
	})
}
