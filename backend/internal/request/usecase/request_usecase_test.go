package usecase

import (
	"context"
	"testing"

	"backend/internal/domain"
	"backend/internal/request/repository"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestRequestUsecase_Create(t *testing.T) {
	t.Run("should create request successfully with manual assignee", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		mockUserRepo := new(repository.MockUserRepository)
		uc := NewRequestUsecase(mockReqRepo, mockUserRepo)

		input := domain.CreateRequestInput{
			Title:       "Test Title",
			Description: "Test Desc",
			Priority:    domain.PriorityMedium,
			AssigneeID:  "handler-123",
			CreatorID:   "creator-456",
		}

		user := &domain.User{ID: "handler-123", Role: domain.RoleHandler}

		mockUserRepo.On("GetByID", mock.Anything, "handler-123").Return(user, nil)
		mockReqRepo.On("Create", mock.Anything, mock.MatchedBy(func(req *domain.ServiceRequest) bool {
			return req.Title == "Test Title" && *req.AssigneeID == "handler-123"
		})).Return(nil)

		// Act
		result, err := uc.Create(context.Background(), input)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "Test Title", result.Title)
		assert.Equal(t, "handler-123", *result.AssigneeID)
		mockUserRepo.AssertExpectations(t)
		mockReqRepo.AssertExpectations(t)
	})

	t.Run("should auto-assign when assignee_id is empty", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		mockUserRepo := new(repository.MockUserRepository)
		uc := NewRequestUsecase(mockReqRepo, mockUserRepo)

		input := domain.CreateRequestInput{
			Title:       "Test Title",
			Description: "Test Desc",
			Priority:    domain.PriorityMedium,
			CreatorID:   "creator-456",
		}

		mockReqRepo.On("GetHandlerWithFewestRequests", mock.Anything).Return("auto-handler", nil)
		mockReqRepo.On("Create", mock.Anything, mock.MatchedBy(func(req *domain.ServiceRequest) bool {
			return req.Title == "Test Title" && *req.AssigneeID == "auto-handler"
		})).Return(nil)

		// Act
		result, err := uc.Create(context.Background(), input)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "auto-handler", *result.AssigneeID)
		mockReqRepo.AssertExpectations(t)
	})

	t.Run("should return error when title is empty", func(t *testing.T) {
		// Arrange
		uc := NewRequestUsecase(nil, nil)
		input := domain.CreateRequestInput{Description: "Desc", Priority: domain.PriorityLow}

		// Act
		_, err := uc.Create(context.Background(), input)

		// Assert
		assert.ErrorIs(t, err, ErrTitleRequired)
	})

	t.Run("should return error when description is empty", func(t *testing.T) {
		// Arrange
		uc := NewRequestUsecase(nil, nil)
		input := domain.CreateRequestInput{Title: "Title", Priority: domain.PriorityLow}

		// Act
		_, err := uc.Create(context.Background(), input)

		// Assert
		assert.ErrorIs(t, err, ErrDescriptionRequired)
	})

	t.Run("should return error when priority is invalid", func(t *testing.T) {
		// Arrange
		uc := NewRequestUsecase(nil, nil)
		input := domain.CreateRequestInput{Title: "Title", Description: "Desc", Priority: "critical"}

		// Act
		_, err := uc.Create(context.Background(), input)

		// Assert
		assert.ErrorIs(t, err, ErrInvalidPriority)
	})

	t.Run("should return error when assignee is not found", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		mockUserRepo := new(repository.MockUserRepository)
		uc := NewRequestUsecase(mockReqRepo, mockUserRepo)

		input := domain.CreateRequestInput{
			Title:       "Title",
			Description: "Desc",
			Priority:    domain.PriorityLow,
			AssigneeID:  "non-existent",
		}

		mockUserRepo.On("GetByID", mock.Anything, "non-existent").Return(nil, nil)

		// Act
		_, err := uc.Create(context.Background(), input)

		// Assert
		assert.ErrorIs(t, err, ErrAssigneeNotFound)
		mockUserRepo.AssertExpectations(t)
	})
}

func TestRequestUsecase_GetByID(t *testing.T) {
	t.Run("handler should view any request", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		req := &domain.ServiceRequest{ID: "req-1", CreatorID: "requester-1"}
		mockReqRepo.On("GetByID", mock.Anything, "req-1").Return(req, nil)

		// Act
		result, err := uc.GetByID(context.Background(), "req-1", "handler-1", "handler")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, req, result)
	})

	t.Run("requester should view their own request", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		req := &domain.ServiceRequest{ID: "req-1", CreatorID: "requester-1"}
		mockReqRepo.On("GetByID", mock.Anything, "req-1").Return(req, nil)

		// Act
		result, err := uc.GetByID(context.Background(), "req-1", "requester-1", "requester")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, req, result)
	})

	t.Run("requester should be forbidden from viewing another request", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		req := &domain.ServiceRequest{ID: "req-1", CreatorID: "requester-2"}
		mockReqRepo.On("GetByID", mock.Anything, "req-1").Return(req, nil)

		// Act
		_, err := uc.GetByID(context.Background(), "req-1", "requester-1", "requester")

		// Assert
		assert.ErrorIs(t, err, ErrForbidden)
	})

	t.Run("should return not found when request does not exist", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		mockReqRepo.On("GetByID", mock.Anything, "req-absent").Return(nil, nil)

		// Act
		_, err := uc.GetByID(context.Background(), "req-absent", "user-1", "handler")

		// Assert
		assert.ErrorIs(t, err, ErrRequestNotFound)
	})
}

func TestRequestUsecase_Update(t *testing.T) {
	t.Run("should update successfully with valid parameters", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		mockUserRepo := new(repository.MockUserRepository)
		uc := NewRequestUsecase(mockReqRepo, mockUserRepo)

		existing := &domain.ServiceRequest{ID: "req-1", Priority: domain.PriorityLow, Status: domain.StatusOpen}
		mockReqRepo.On("GetByID", mock.Anything, "req-1").Return(existing, nil)

		newPriority := domain.PriorityHigh
		newStatus := domain.StatusInProgress
		newAssignee := "handler-2"
		input := domain.UpdateRequestInput{
			Priority:   &newPriority,
			Status:     &newStatus,
			AssigneeID: &newAssignee,
		}

		user := &domain.User{ID: "handler-2", Role: domain.RoleHandler}
		mockUserRepo.On("GetByID", mock.Anything, "handler-2").Return(user, nil)

		updated := &domain.ServiceRequest{ID: "req-1", Priority: domain.PriorityHigh, Status: domain.StatusInProgress, AssigneeID: &newAssignee}
		mockReqRepo.On("Update", mock.Anything, "req-1", input).Return(updated, nil)

		// Act
		result, err := uc.Update(context.Background(), "req-1", input, "handler-1", string(domain.RoleHandler))

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, domain.PriorityHigh, result.Priority)
		assert.Equal(t, domain.StatusInProgress, result.Status)
		mockReqRepo.AssertExpectations(t)
		mockUserRepo.AssertExpectations(t)
	})

	t.Run("should return error when request to update is not found", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		mockReqRepo.On("GetByID", mock.Anything, "req-absent").Return(nil, nil)

		// Act
		_, err := uc.Update(context.Background(), "req-absent", domain.UpdateRequestInput{}, "handler-1", string(domain.RoleHandler))

		// Assert
		assert.ErrorIs(t, err, ErrRequestNotFound)
	})

	t.Run("should return error when update priority is invalid", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		existing := &domain.ServiceRequest{ID: "req-1"}
		mockReqRepo.On("GetByID", mock.Anything, "req-1").Return(existing, nil)

		invalidPriority := domain.Priority("invalid")
		input := domain.UpdateRequestInput{Priority: &invalidPriority}

		// Act
		_, err := uc.Update(context.Background(), "req-1", input, "handler-1", string(domain.RoleHandler))

		// Assert
		assert.ErrorIs(t, err, ErrInvalidPriority)
	})
}

func TestRequestUsecase_List(t *testing.T) {
	t.Run("should_list_requests_successfully", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		filter := domain.ListRequestsFilter{Limit: 10, Offset: 0}
		expected := &domain.RequestListResult{
			Data:  []domain.ServiceRequest{{ID: "1", Title: "Request 1"}},
			Total: 1,
		}
		mockReqRepo.On("List", mock.Anything, filter).Return(expected, nil)

		// Act
		result, err := uc.List(context.Background(), filter, "handler")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
		mockReqRepo.AssertExpectations(t)
	})

	t.Run("should_clamp_limit_to_20_when_zero", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		filter := domain.ListRequestsFilter{Limit: 0, Offset: 0}
		clampedFilter := domain.ListRequestsFilter{Limit: 20, Offset: 0}
		expected := &domain.RequestListResult{Data: []domain.ServiceRequest{}, Total: 0}
		mockReqRepo.On("List", mock.Anything, clampedFilter).Return(expected, nil)

		// Act
		result, err := uc.List(context.Background(), filter, "handler")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
		mockReqRepo.AssertExpectations(t)
	})

	t.Run("should_clamp_limit_to_100_when_over_maximum", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		filter := domain.ListRequestsFilter{Limit: 9999, Offset: 0}
		clampedFilter := domain.ListRequestsFilter{Limit: 100, Offset: 0}
		expected := &domain.RequestListResult{Data: []domain.ServiceRequest{}, Total: 0}
		mockReqRepo.On("List", mock.Anything, clampedFilter).Return(expected, nil)

		// Act
		result, err := uc.List(context.Background(), filter, "handler")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
		mockReqRepo.AssertExpectations(t)
	})

	t.Run("should_clamp_negative_offset_to_zero", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		filter := domain.ListRequestsFilter{Limit: 10, Offset: -5}
		clampedFilter := domain.ListRequestsFilter{Limit: 10, Offset: 0}
		expected := &domain.RequestListResult{Data: []domain.ServiceRequest{}, Total: 0}
		mockReqRepo.On("List", mock.Anything, clampedFilter).Return(expected, nil)

		// Act
		result, err := uc.List(context.Background(), filter, "handler")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
		mockReqRepo.AssertExpectations(t)
	})
}

func TestRequestUsecase_Update_AdditionalBranches(t *testing.T) {
	t.Run("should_return_error_when_update_status_is_invalid", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		existing := &domain.ServiceRequest{ID: "req-1"}
		mockReqRepo.On("GetByID", mock.Anything, "req-1").Return(existing, nil)

		invalidStatus := domain.Status("unknown-status")
		input := domain.UpdateRequestInput{Status: &invalidStatus}

		// Act
		_, err := uc.Update(context.Background(), "req-1", input, "handler-1", string(domain.RoleHandler))

		// Assert
		assert.ErrorIs(t, err, ErrInvalidStatus)
	})

	t.Run("should_return_error_when_update_assignee_is_not_found", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		mockUserRepo := new(repository.MockUserRepository)
		uc := NewRequestUsecase(mockReqRepo, mockUserRepo)

		existing := &domain.ServiceRequest{ID: "req-1"}
		mockReqRepo.On("GetByID", mock.Anything, "req-1").Return(existing, nil)

		missingAssignee := "missing-handler"
		input := domain.UpdateRequestInput{AssigneeID: &missingAssignee}
		mockUserRepo.On("GetByID", mock.Anything, "missing-handler").Return(nil, nil)

		// Act
		_, err := uc.Update(context.Background(), "req-1", input, "handler-1", string(domain.RoleHandler))

		// Assert
		assert.ErrorIs(t, err, ErrAssigneeNotFound)
		mockUserRepo.AssertExpectations(t)
	})
}

func TestRequestUsecase_Create_AutoAssignError(t *testing.T) {
	t.Run("should_propagate_error_from_auto_assign_repo", func(t *testing.T) {
		// Arrange
		mockReqRepo := new(repository.MockRequestRepository)
		uc := NewRequestUsecase(mockReqRepo, nil)

		input := domain.CreateRequestInput{
			Title:       "Test",
			Description: "Desc",
			Priority:    domain.PriorityLow,
		}

		mockReqRepo.On("GetHandlerWithFewestRequests", mock.Anything).Return("", assert.AnError)

		// Act
		_, err := uc.Create(context.Background(), input)

		// Assert
		assert.Error(t, err)
		mockReqRepo.AssertExpectations(t)
	})
}
