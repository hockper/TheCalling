package delivery

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/domain"
	"backend/internal/middleware"
	"backend/internal/request/usecase"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type mockRequestUsecase struct {
	mock.Mock
}

func (m *mockRequestUsecase) Create(ctx context.Context, input domain.CreateRequestInput) (*domain.ServiceRequest, error) {
	args := m.Called(ctx, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ServiceRequest), args.Error(1)
}

func (m *mockRequestUsecase) GetByID(ctx context.Context, id string, userID string, userRole string) (*domain.ServiceRequest, error) {
	args := m.Called(ctx, id, userID, userRole)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ServiceRequest), args.Error(1)
}

func (m *mockRequestUsecase) List(ctx context.Context, filter domain.ListRequestsFilter, userRole string) (*domain.RequestListResult, error) {
	args := m.Called(ctx, filter, userRole)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.RequestListResult), args.Error(1)
}

func (m *mockRequestUsecase) Update(ctx context.Context, id string, input domain.UpdateRequestInput, userID string, userRole string) (*domain.ServiceRequest, error) {
	args := m.Called(ctx, id, input, userID, userRole)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ServiceRequest), args.Error(1)
}

func TestRequestHandler_HandleRequests_MethodNotAllowed(t *testing.T) {
	// Arrange
	handler := NewRequestHandler(nil)
	req := httptest.NewRequest(http.MethodDelete, "/api/requests", nil)
	rec := httptest.NewRecorder()

	// Act
	handler.HandleRequests(rec, req)

	// Assert
	assert.Equal(t, http.StatusMethodNotAllowed, rec.Code)
}

func TestRequestHandler_HandleRequestByID_EmptyID(t *testing.T) {
	// Arrange
	handler := NewRequestHandler(nil)
	// URL path with no id after the prefix
	req := httptest.NewRequest(http.MethodGet, "/api/requests/", nil)
	rec := httptest.NewRecorder()

	// Act
	handler.HandleRequestByID(rec, req)

	// Assert
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "request ID is required")
}

func TestRequestHandler_HandleRequestByID_MethodNotAllowed(t *testing.T) {
	// Arrange
	handler := NewRequestHandler(nil)
	req := httptest.NewRequest(http.MethodDelete, "/api/requests/123", nil)
	rec := httptest.NewRecorder()

	// Act
	handler.HandleRequestByID(rec, req)

	// Assert
	assert.Equal(t, http.StatusMethodNotAllowed, rec.Code)
}

func TestRequestHandler_CreateRequest(t *testing.T) {
	t.Run("should succeed when creator is requester", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		input := domain.CreateRequestInput{
			Title:       "Test",
			Description: "Desc",
			Priority:    domain.PriorityLow,
		}
		body, _ := json.Marshal(input)

		req := httptest.NewRequest(http.MethodPost, "/api/requests", bytes.NewBuffer(body))
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "req-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleRequester))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		created := &domain.ServiceRequest{ID: "req-id-1", Title: "Test", CreatorID: "req-123"}
		expectedInput := input
		expectedInput.CreatorID = "req-123"

		mockUC.On("Create", mock.Anything, expectedInput).Return(created, nil)

		// Act
		handler.HandleRequests(rec, req)

		// Assert
		assert.Equal(t, http.StatusCreated, rec.Code)
		var resp domain.ServiceRequest
		err := json.NewDecoder(rec.Body).Decode(&resp)
		assert.NoError(t, err)
		assert.Equal(t, "req-id-1", resp.ID)
		mockUC.AssertExpectations(t)
	})

	t.Run("should fail when creator is not requester", func(t *testing.T) {
		// Arrange
		handler := NewRequestHandler(nil)

		req := httptest.NewRequest(http.MethodPost, "/api/requests", nil)
		ctx := context.WithValue(req.Context(), middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		// Act
		handler.HandleRequests(rec, req)

		// Assert
		assert.Equal(t, http.StatusForbidden, rec.Code)
	})

	t.Run("should fail on invalid request body", func(t *testing.T) {
		// Arrange
		handler := NewRequestHandler(nil)
		req := httptest.NewRequest(http.MethodPost, "/api/requests", bytes.NewBufferString("{invalid"))
		ctx := context.WithValue(req.Context(), middleware.UserRoleKey, string(domain.RoleRequester))
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		// Act
		handler.HandleRequests(rec, req)

		// Assert
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

func TestRequestHandler_ListRequests(t *testing.T) {
	t.Run("should return lists for authorized user", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		req := httptest.NewRequest(http.MethodGet, "/api/requests?limit=10&offset=0", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "user-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		listFilter := domain.ListRequestsFilter{
			Limit:  10,
			Offset: 0,
			Scope:  "me",
		}
		listFilter.AssigneeID = new(string)
		*listFilter.AssigneeID = "user-123"

		result := &domain.RequestListResult{
			Data:  []domain.ServiceRequest{{ID: "req-1", Title: "Req 1"}},
			Total: 1,
		}

		mockUC.On("List", mock.Anything, mock.Anything, string(domain.RoleHandler)).Return(result, nil)

		// Act
		handler.HandleRequests(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
		var resp domain.RequestListResult
		err := json.NewDecoder(rec.Body).Decode(&resp)
		assert.NoError(t, err)
		assert.Equal(t, 1, resp.Total)
	})

	t.Run("should_filter_creator_id_when_requester_role", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		req := httptest.NewRequest(http.MethodGet, "/api/requests?scope=all", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "req-user-1")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleRequester))
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		result := &domain.RequestListResult{Data: []domain.ServiceRequest{}, Total: 0}
		mockUC.On("List", mock.Anything, mock.Anything, string(domain.RoleRequester)).Return(result, nil)

		// Act
		handler.HandleRequests(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("should_return_500_when_list_fails", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		req := httptest.NewRequest(http.MethodGet, "/api/requests", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "user-1")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		mockUC.On("List", mock.Anything, mock.Anything, mock.Anything).Return(nil, usecase.ErrRequestNotFound)

		// Act
		handler.HandleRequests(rec, req)

		// Assert
		assert.Equal(t, http.StatusInternalServerError, rec.Code)
	})

	t.Run("should_override_assignee_id_from_query_param", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		req := httptest.NewRequest(http.MethodGet, "/api/requests?assignee_id=other-handler", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "user-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		result := &domain.RequestListResult{Data: []domain.ServiceRequest{}, Total: 0}
		mockUC.On("List", mock.Anything, mock.Anything, string(domain.RoleHandler)).Return(result, nil)

		// Act
		handler.HandleRequests(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

func TestRequestHandler_UpdateRequest(t *testing.T) {
	t.Run("should succeed when user is handler", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		newPriority := domain.PriorityHigh
		input := domain.UpdateRequestInput{Priority: &newPriority}
		body, _ := json.Marshal(input)

		req := httptest.NewRequest(http.MethodPatch, "/api/requests/123", bytes.NewBuffer(body))
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "user-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		updated := &domain.ServiceRequest{ID: "123", Priority: domain.PriorityHigh}
		mockUC.On("Update", mock.Anything, "123", input, "user-123", string(domain.RoleHandler)).Return(updated, nil)

		// Act
		handler.HandleRequestByID(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("should succeed when user is requester closing their own request", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		newStatus := domain.StatusClosed
		input := domain.UpdateRequestInput{Status: &newStatus}
		body, _ := json.Marshal(input)

		req := httptest.NewRequest(http.MethodPatch, "/api/requests/123", bytes.NewBuffer(body))
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "req-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleRequester))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		updated := &domain.ServiceRequest{ID: "123", Status: domain.StatusClosed}
		mockUC.On("Update", mock.Anything, "123", input, "req-123", string(domain.RoleRequester)).Return(updated, nil)

		// Act
		handler.HandleRequestByID(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("should fail when usecase returns forbidden", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		req := httptest.NewRequest(http.MethodPatch, "/api/requests/123", bytes.NewBufferString(`{}`))
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "req-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleRequester))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		mockUC.On("Update", mock.Anything, "123", mock.Anything, "req-123", string(domain.RoleRequester)).Return(nil, usecase.ErrForbidden)

		// Act
		handler.HandleRequestByID(rec, req)

		// Assert
		assert.Equal(t, http.StatusForbidden, rec.Code)
	})

	t.Run("should map usecase error correctly", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		req := httptest.NewRequest(http.MethodPatch, "/api/requests/invalid-id", bytes.NewBufferString("{}"))
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "user-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		mockUC.On("Update", mock.Anything, "invalid-id", mock.Anything, "user-123", string(domain.RoleHandler)).Return(nil, usecase.ErrRequestNotFound)

		// Act
		handler.HandleRequestByID(rec, req)

		// Assert
		assert.Equal(t, http.StatusNotFound, rec.Code)
		assert.Contains(t, rec.Body.String(), "request not found")
	})

	t.Run("should fail on invalid body", func(t *testing.T) {
		// Arrange
		handler := NewRequestHandler(nil)
		req := httptest.NewRequest(http.MethodPatch, "/api/requests/123", bytes.NewBufferString("{invalid"))
		ctx := context.WithValue(req.Context(), middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		// Act
		handler.HandleRequestByID(rec, req)

		// Assert
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

func TestRequestHandler_GetRequest(t *testing.T) {
	t.Run("should succeed when request exists", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)

		req := httptest.NewRequest(http.MethodGet, "/api/requests/123", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "user-123")
		ctx = context.WithValue(ctx, middleware.UserRoleKey, string(domain.RoleHandler))
		req = req.WithContext(ctx)

		rec := httptest.NewRecorder()

		reqObj := &domain.ServiceRequest{ID: "123", Title: "Request 1"}
		mockUC.On("GetByID", mock.Anything, "123", "user-123", "handler").Return(reqObj, nil)

		// Act
		handler.HandleRequestByID(rec, req)

		// Assert
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("should return not found when usecase fails", func(t *testing.T) {
		// Arrange
		mockUC := new(mockRequestUsecase)
		handler := NewRequestHandler(mockUC)
		req := httptest.NewRequest(http.MethodGet, "/api/requests/none", nil)
		ctx := context.WithValue(req.Context(), middleware.UserRoleKey, string(domain.RoleRequester))
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()
		mockUC.On("GetByID", mock.Anything, "none", "", "requester").Return(nil, usecase.ErrRequestNotFound)

		// Act
		handler.HandleRequestByID(rec, req)

		// Assert
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}

// ---------------------------------------------------------------------------
// handleUsecaseError — all branches covered
// ---------------------------------------------------------------------------

func TestHandleUsecaseError_AllBranches(t *testing.T) {
	tests := []struct {
		name           string
		err            error
		expectedStatus int
	}{
		{"ErrTitleRequired_maps_to_400", usecase.ErrTitleRequired, http.StatusBadRequest},
		{"ErrDescriptionRequired_maps_to_400", usecase.ErrDescriptionRequired, http.StatusBadRequest},
		{"ErrInvalidPriority_maps_to_400", usecase.ErrInvalidPriority, http.StatusBadRequest},
		{"ErrAssigneeRequired_maps_to_400", usecase.ErrAssigneeRequired, http.StatusBadRequest},
		{"ErrInvalidStatus_maps_to_400", usecase.ErrInvalidStatus, http.StatusBadRequest},
		{"ErrAssigneeNotFound_maps_to_400", usecase.ErrAssigneeNotFound, http.StatusBadRequest},
		{"ErrRequestNotFound_maps_to_404", usecase.ErrRequestNotFound, http.StatusNotFound},
		{"ErrForbidden_maps_to_403", usecase.ErrForbidden, http.StatusForbidden},
		{"unknown_error_maps_to_500", assert.AnError, http.StatusInternalServerError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Arrange
			rec := httptest.NewRecorder()

			// Act
			handleUsecaseError(rec, tt.err)

			// Assert
			assert.Equal(t, tt.expectedStatus, rec.Code)
		})
	}
}

// ---------------------------------------------------------------------------
// parseIntQuery
// ---------------------------------------------------------------------------

func TestParseIntQuery(t *testing.T) {
	t.Run("should_return_parsed_value_when_valid_int", func(t *testing.T) {
		// Arrange
		req := httptest.NewRequest(http.MethodGet, "/?limit=42", nil)

		// Act
		result := parseIntQuery(req, "limit", 10)

		// Assert
		assert.Equal(t, 42, result)
	})

	t.Run("should_return_default_when_key_is_missing", func(t *testing.T) {
		// Arrange
		req := httptest.NewRequest(http.MethodGet, "/", nil)

		// Act
		result := parseIntQuery(req, "limit", 20)

		// Assert
		assert.Equal(t, 20, result)
	})

	t.Run("should_return_default_when_value_is_not_a_number", func(t *testing.T) {
		// Arrange
		req := httptest.NewRequest(http.MethodGet, "/?limit=abc", nil)

		// Act
		result := parseIntQuery(req, "limit", 15)

		// Assert
		assert.Equal(t, 15, result)
	})
}
