package http

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/domain"
	"backend/internal/request/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

func TestUserHandler_Login(t *testing.T) {
	password := "correct-password"
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	testUser := &domain.User{
		ID:           "user-123",
		Email:        "user@test.com",
		Name:         "Alice Tester",
		Role:         domain.RoleRequester,
		PasswordHash: string(hash),
		CreatedAt:    time.Now(),
	}

	t.Run("should login successfully", func(t *testing.T) {
		mockRepo := new(repository.MockUserRepository)
		handler := &UserHandler{jwtSecret: []byte("test-jwt-secret-key-at-least-32-bytes"), userRepo: mockRepo}
		mockRepo.On("GetByEmail", mock.Anything, "user@test.com").Return(testUser, nil)

		loginReq := LoginRequest{Email: "user@test.com", Password: password}
		body, _ := json.Marshal(loginReq)
		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		handler.Login(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		mockRepo.AssertExpectations(t)
	})

	t.Run("should fail on bad json", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBuffer([]byte("{invalid")))
		rec := httptest.NewRecorder()
		handler := &UserHandler{}
		handler.Login(rec, req)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})

	t.Run("should fail on repository error", func(t *testing.T) {
		mockRepo := new(repository.MockUserRepository)
		handler := &UserHandler{userRepo: mockRepo}
		mockRepo.On("GetByEmail", mock.Anything, "err@test.com").Return(nil, errors.New("db error"))

		body, _ := json.Marshal(LoginRequest{Email: "err@test.com", Password: "pwd"})
		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()
		handler.Login(rec, req)
		assert.Equal(t, http.StatusInternalServerError, rec.Code)
	})
}

func TestUserHandler_Me(t *testing.T) {
	testUser := &domain.User{ID: "user-123", Email: "user@test.com"}

	t.Run("should return profile", func(t *testing.T) {
		mockRepo := new(repository.MockUserRepository)
		handler := &UserHandler{jwtSecret: []byte("test-jwt-secret-key-at-least-32-bytes"), userRepo: mockRepo}
		mockRepo.On("GetByID", mock.Anything, "user-123").Return(testUser, nil)

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": "user-123", "exp": time.Now().Add(time.Hour).Unix()})
		tokenString, _ := token.SignedString(handler.jwtSecret)

		req := httptest.NewRequest(http.MethodGet, "/api/users/me", nil)
		req.AddCookie(&http.Cookie{Name: "token", Value: tokenString})
		rec := httptest.NewRecorder()

		handler.Me(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("should fail without token", func(t *testing.T) {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/api/users/me", nil)
		(&UserHandler{jwtSecret: []byte("secret")}).Me(rec, req)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})
}

func TestUserHandler_Logout(t *testing.T) {
	handler := &UserHandler{}
	req := httptest.NewRequest(http.MethodPost, "/api/logout", nil)
	rec := httptest.NewRecorder()
	handler.Logout(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestUserHandler_ListUsers(t *testing.T) {
	t.Run("should list users", func(t *testing.T) {
		mockRepo := new(repository.MockUserRepository)
		handler := &UserHandler{userRepo: mockRepo}
		mockRepo.On("List", mock.Anything, "admin").Return([]*domain.User{{ID: "1"}}, nil)

		req := httptest.NewRequest(http.MethodGet, "/api/users?role=admin", nil)
		rec := httptest.NewRecorder()
		handler.ListUsers(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("should return error on repo failure", func(t *testing.T) {
		mockRepo := new(repository.MockUserRepository)
		handler := &UserHandler{userRepo: mockRepo}
		mockRepo.On("List", mock.Anything, "").Return(nil, errors.New("fail"))
		req := httptest.NewRequest(http.MethodGet, "/api/users", nil)
		rec := httptest.NewRecorder()
		handler.ListUsers(rec, req)
		assert.Equal(t, http.StatusInternalServerError, rec.Code)
	})
}

func TestNewUserHandler(t *testing.T) {
	db, _, err := sqlmock.New()
	assert.NoError(t, err)
	defer func() { _ = db.Close() }()

	handler := NewUserHandler("secret", db)
	assert.NotNil(t, handler)
	assert.Equal(t, []byte("secret"), handler.jwtSecret)
}
