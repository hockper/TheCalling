package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestJWTSecurity(t *testing.T) {
	secretKey := []byte("original-super-secret-key-for-jwt-32-bytes")
	forgedKey := []byte("forged-key-forged-key-forged-key-32-bytes")

	testHandler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	t.Run("should_fail_when_token_is_signed_with_forged_key", func(t *testing.T) {
		// Arrange: Generate token using forged key
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":   "12345",
			"email": "hacker@evil.com",
			"role":  "handler",
			"exp":   time.Now().Add(time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString(forgedKey)

		req := httptest.NewRequest(http.MethodGet, "/api/requests", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: tokenString})
		rec := httptest.NewRecorder()

		// Act: Run through middleware
		AuthMiddleware(secretKey)(testHandler).ServeHTTP(rec, req)

		// Assert: Expect unauthorized due to invalid signature
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Contains(t, rec.Body.String(), "invalid token")
	})

	t.Run("should_fail_when_token_uses_none_algorithm", func(t *testing.T) {
		// Arrange: Generate token with 'none' signing method (unsafe)
		// We can use UnsafeAllowNoneSignatureType since we want to create a token with none method for testing
		token := jwt.NewWithClaims(jwt.SigningMethodNone, jwt.MapClaims{
			"sub":   "12345",
			"email": "hacker@evil.com",
			"role":  "handler",
			"exp":   time.Now().Add(time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString(jwt.UnsafeAllowNoneSignatureType)

		req := httptest.NewRequest(http.MethodGet, "/api/requests", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: tokenString})
		rec := httptest.NewRecorder()

		// Act: Run through middleware
		AuthMiddleware(secretKey)(testHandler).ServeHTTP(rec, req)

		// Assert: Expect unauthorized because none method is blocked
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Contains(t, rec.Body.String(), "invalid token")
	})

	t.Run("should_fail_when_token_is_expired", func(t *testing.T) {
		// Arrange: Generate token that expired 1 hour ago
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":   "12345",
			"email": "hacker@evil.com",
			"role":  "handler",
			"exp":   time.Now().Add(-time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString(secretKey)

		req := httptest.NewRequest(http.MethodGet, "/api/requests", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: tokenString})
		rec := httptest.NewRecorder()

		// Act: Run through middleware
		AuthMiddleware(secretKey)(testHandler).ServeHTTP(rec, req)

		// Assert: Expect unauthorized
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Contains(t, rec.Body.String(), "invalid token")
	})

	t.Run("should_fail_when_required_claims_are_missing", func(t *testing.T) {
		// Arrange: Generate token missing 'role' claim
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":   "12345",
			"email": "user@test.com",
			"exp":   time.Now().Add(time.Hour).Unix(),
		})
		tokenString, _ := token.SignedString(secretKey)

		req := httptest.NewRequest(http.MethodGet, "/api/requests", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: tokenString})
		rec := httptest.NewRecorder()

		// Act: Run through middleware
		AuthMiddleware(secretKey)(testHandler).ServeHTTP(rec, req)

		// Assert: Expect unauthorized due to incomplete claims
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		assert.Contains(t, rec.Body.String(), "incomplete claims")
	})
}
