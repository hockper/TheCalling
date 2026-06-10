// Package usecase provides the business logic for the request module.
package usecase

import (
	"context"
	"errors"

	"backend/internal/domain"
)

var (
	// ErrTitleRequired is returned when the title field is empty.
	ErrTitleRequired = errors.New("title is required")
	// ErrDescriptionRequired is returned when the description field is empty.
	ErrDescriptionRequired = errors.New("description is required")
	// ErrInvalidPriority is returned when the priority value is not valid.
	ErrInvalidPriority = errors.New("priority must be one of: low, medium, high")
	// ErrAssigneeRequired is returned when the assignee_id field is empty.
	ErrAssigneeRequired = errors.New("assignee_id is required")
	// ErrInvalidStatus is returned when the status value is not valid.
	ErrInvalidStatus = errors.New("status must be one of: open, in_progress, resolved, closed")
	// ErrRequestNotFound is returned when a request with the given ID does not exist.
	ErrRequestNotFound = errors.New("request not found")
	// ErrForbidden is returned when the user does not have permission for the operation.
	ErrForbidden = errors.New("forbidden: insufficient permissions")
	// ErrAssigneeNotFound is returned when the assignee user does not exist.
	ErrAssigneeNotFound = errors.New("assignee user not found")
)

// RequestUsecaseImpl implements domain.RequestUsecase.
type RequestUsecaseImpl struct {
	requestRepo domain.RequestRepository
	userRepo    domain.UserRepository
}

// NewRequestUsecase creates a new RequestUsecaseImpl.
func NewRequestUsecase(requestRepo domain.RequestRepository, userRepo domain.UserRepository) *RequestUsecaseImpl {
	return &RequestUsecaseImpl{
		requestRepo: requestRepo,
		userRepo:    userRepo,
	}
}

// Create validates input and creates a new service request.
func (u *RequestUsecaseImpl) Create(ctx context.Context, input domain.CreateRequestInput) (*domain.ServiceRequest, error) {
	// Validate required fields
	if input.Title == "" {
		return nil, ErrTitleRequired
	}
	if input.Description == "" {
		return nil, ErrDescriptionRequired
	}
	if !input.Priority.IsValid() {
		return nil, ErrInvalidPriority
	}
	assigneeID := input.AssigneeID
	if assigneeID == "" {
		handlerID, err := u.requestRepo.GetHandlerWithFewestRequests(ctx)
		if err != nil {
			return nil, err
		}
		assigneeID = handlerID
	} else {
		// Validate that the assignee exists
		assignee, err := u.userRepo.GetByID(ctx, assigneeID)
		if err != nil {
			return nil, err
		}
		if assignee == nil {
			return nil, ErrAssigneeNotFound
		}
	}
	req := &domain.ServiceRequest{
		Title:       input.Title,
		Description: input.Description,
		Priority:    input.Priority,
		CreatorID:   input.CreatorID,
		AssigneeID:  &assigneeID,
	}

	if err := u.requestRepo.Create(ctx, req); err != nil {
		return nil, err
	}

	return req, nil
}

// GetByID retrieves a request by ID with role-based access control.
// Handlers can view any request. Requesters can only view their own.
func (u *RequestUsecaseImpl) GetByID(ctx context.Context, id string, userID string, userRole string) (*domain.ServiceRequest, error) {
	req, err := u.requestRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req == nil {
		return nil, ErrRequestNotFound
	}

	// Requesters can only view their own requests
	if userRole == string(domain.RoleRequester) && req.CreatorID != userID {
		return nil, ErrForbidden
	}

	return req, nil
}

// List retrieves a paginated list of service requests.
// Handlers see all requests. Requesters only see their own.
func (u *RequestUsecaseImpl) List(ctx context.Context, filter domain.ListRequestsFilter, _ string) (*domain.RequestListResult, error) {
	// Enforce default limits
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}
	if filter.Offset < 0 {
		filter.Offset = 0
	}

	return u.requestRepo.List(ctx, filter)
}

// Update validates input and updates an existing service request.
func (u *RequestUsecaseImpl) Update(ctx context.Context, id string, input domain.UpdateRequestInput) (*domain.ServiceRequest, error) {
	// Check that the request exists
	existing, err := u.requestRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, ErrRequestNotFound
	}

	// Validate optional fields if provided
	if input.Priority != nil && !input.Priority.IsValid() {
		return nil, ErrInvalidPriority
	}
	if input.Status != nil && !input.Status.IsValid() {
		return nil, ErrInvalidStatus
	}

	// Validate assignee if being changed
	if input.AssigneeID != nil && *input.AssigneeID != "" {
		assignee, err := u.userRepo.GetByID(ctx, *input.AssigneeID)
		if err != nil {
			return nil, err
		}
		if assignee == nil {
			return nil, ErrAssigneeNotFound
		}
	}

	return u.requestRepo.Update(ctx, id, input)
}
