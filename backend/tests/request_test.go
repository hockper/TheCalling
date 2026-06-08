package tests

import (
	"context"
	"testing"

	"backend/internal/domain"
	"backend/internal/request/usecase"
)

// mockRequestRepo is a simple in-memory mock for testing.
type mockRequestRepo struct {
	requests map[string]*domain.ServiceRequest
	nextID   int
}

func newMockRequestRepo() *mockRequestRepo {
	return &mockRequestRepo{
		requests: make(map[string]*domain.ServiceRequest),
	}
}

func (m *mockRequestRepo) Create(ctx context.Context, req *domain.ServiceRequest) error {
	m.requests[req.ID] = req
	return nil
}

func (m *mockRequestRepo) GetByID(ctx context.Context, id string) (*domain.ServiceRequest, error) {
	req, ok := m.requests[id]
	if !ok {
		return nil, nil
	}
	return req, nil
}

func (m *mockRequestRepo) List(ctx context.Context, filter domain.ListRequestsFilter) (*domain.RequestListResult, error) {
	var results []domain.ServiceRequest
	for _, req := range m.requests {
		if filter.CreatorID != nil && req.CreatorID != *filter.CreatorID {
			continue
		}
		results = append(results, *req)
	}

	// Apply pagination
	total := len(results)
	start := filter.Offset
	if start > len(results) {
		start = len(results)
	}
	end := start + filter.Limit
	if end > len(results) {
		end = len(results)
	}

	return &domain.RequestListResult{
		Data:  results[start:end],
		Total: total,
	}, nil
}

func (m *mockRequestRepo) Update(ctx context.Context, id string, input domain.UpdateRequestInput) (*domain.ServiceRequest, error) {
	req, ok := m.requests[id]
	if !ok {
		return nil, nil
	}
	if input.Title != nil {
		req.Title = *input.Title
	}
	if input.Description != nil {
		req.Description = *input.Description
	}
	if input.Priority != nil {
		req.Priority = *input.Priority
	}
	if input.Status != nil {
		req.Status = *input.Status
	}
	if input.AssigneeID != nil {
		req.AssigneeID = input.AssigneeID
	}
	return req, nil
}

// mockUserRepo is a simple in-memory mock for user lookups.
type mockUserRepo struct {
	users map[string]*domain.User
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{
		users: map[string]*domain.User{
			"handler-id": {
				ID:    "handler-id",
				Name:  "Alice Handler",
				Email: "handler@test.com",
				Role:  domain.RoleHandler,
			},
			"requester-id": {
				ID:    "requester-id",
				Name:  "Bob Requester",
				Email: "requester@test.com",
				Role:  domain.RoleRequester,
			},
			"assignee-id": {
				ID:    "assignee-id",
				Name:  "Charlie Assignee",
				Email: "assignee@test.com",
				Role:  domain.RoleHandler,
			},
		},
	}
}

func (m *mockUserRepo) GetByID(ctx context.Context, id string) (*domain.User, error) {
	user, ok := m.users[id]
	if !ok {
		return nil, nil
	}
	return user, nil
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	for _, user := range m.users {
		if user.Email == email {
			return user, nil
		}
	}
	return nil, nil
}

func (m *mockUserRepo) List(ctx context.Context, role string) ([]*domain.User, error) {
	var users []*domain.User
	for _, user := range m.users {
		if role == "" || string(user.Role) == role {
			users = append(users, user)
		}
	}
	return users, nil
}

func TestCreateRequest_Success(t *testing.T) {
	reqRepo := newMockRequestRepo()
	userRepo := newMockUserRepo()
	uc := usecase.NewRequestUsecase(reqRepo, userRepo)

	input := domain.CreateRequestInput{
		Title:       "Test Request",
		Description: "This is a test request",
		Priority:    domain.PriorityHigh,
		AssigneeID:  "assignee-id",
		CreatorID:   "requester-id",
	}

	req, err := uc.Create(context.Background(), input)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if req.Title != "Test Request" {
		t.Errorf("expected title 'Test Request', got '%s'", req.Title)
	}
	if req.Status != domain.StatusOpen {
		t.Errorf("expected status 'open', got '%s'", req.Status)
	}
	if req.CreatorID != "requester-id" {
		t.Errorf("expected creator_id 'requester-id', got '%s'", req.CreatorID)
	}
}

func TestCreateRequest_ValidationErrors(t *testing.T) {
	reqRepo := newMockRequestRepo()
	userRepo := newMockUserRepo()
	uc := usecase.NewRequestUsecase(reqRepo, userRepo)

	tests := []struct {
		name  string
		input domain.CreateRequestInput
		err   error
	}{
		{
			name:  "missing title",
			input: domain.CreateRequestInput{Description: "desc", Priority: domain.PriorityLow, AssigneeID: "assignee-id", CreatorID: "requester-id"},
			err:   usecase.ErrTitleRequired,
		},
		{
			name:  "missing description",
			input: domain.CreateRequestInput{Title: "title", Priority: domain.PriorityLow, AssigneeID: "assignee-id", CreatorID: "requester-id"},
			err:   usecase.ErrDescriptionRequired,
		},
		{
			name:  "invalid priority",
			input: domain.CreateRequestInput{Title: "title", Description: "desc", Priority: "invalid", AssigneeID: "assignee-id", CreatorID: "requester-id"},
			err:   usecase.ErrInvalidPriority,
		},
		{
			name:  "missing assignee",
			input: domain.CreateRequestInput{Title: "title", Description: "desc", Priority: domain.PriorityLow, CreatorID: "requester-id"},
			err:   usecase.ErrAssigneeRequired,
		},
		{
			name:  "non-existent assignee",
			input: domain.CreateRequestInput{Title: "title", Description: "desc", Priority: domain.PriorityLow, AssigneeID: "nonexistent", CreatorID: "requester-id"},
			err:   usecase.ErrAssigneeNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := uc.Create(context.Background(), tt.input)
			if err == nil {
				t.Fatal("expected error, got nil")
			}
			if err != tt.err {
				t.Errorf("expected error '%v', got '%v'", tt.err, err)
			}
		})
	}
}

func TestGetByID_HandlerCanViewAny(t *testing.T) {
	reqRepo := newMockRequestRepo()
	userRepo := newMockUserRepo()
	uc := usecase.NewRequestUsecase(reqRepo, userRepo)

	// Create a request
	input := domain.CreateRequestInput{
		Title:       "Test",
		Description: "Test",
		Priority:    domain.PriorityLow,
		AssigneeID:  "assignee-id",
		CreatorID:   "requester-id",
	}
	created, _ := uc.Create(context.Background(), input)

	// Handler should be able to view it
	req, err := uc.GetByID(context.Background(), created.ID, "handler-id", string(domain.RoleHandler))
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if req.ID != created.ID {
		t.Errorf("expected ID '%s', got '%s'", created.ID, req.ID)
	}
}

func TestGetByID_RequesterCanOnlyViewOwn(t *testing.T) {
	reqRepo := newMockRequestRepo()
	userRepo := newMockUserRepo()
	uc := usecase.NewRequestUsecase(reqRepo, userRepo)

	// Create a request by requester-id
	input := domain.CreateRequestInput{
		Title:       "Test",
		Description: "Test",
		Priority:    domain.PriorityLow,
		AssigneeID:  "assignee-id",
		CreatorID:   "requester-id",
	}
	created, _ := uc.Create(context.Background(), input)

	// Requester (owner) should be able to view it
	_, err := uc.GetByID(context.Background(), created.ID, "requester-id", string(domain.RoleRequester))
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	// Another requester should NOT be able to view it
	_, err = uc.GetByID(context.Background(), created.ID, "other-requester", string(domain.RoleRequester))
	if err != usecase.ErrForbidden {
		t.Errorf("expected forbidden error, got: %v", err)
	}
}

func TestUpdateRequest_StatusChange(t *testing.T) {
	reqRepo := newMockRequestRepo()
	userRepo := newMockUserRepo()
	uc := usecase.NewRequestUsecase(reqRepo, userRepo)

	// Create a request
	input := domain.CreateRequestInput{
		Title:       "Test",
		Description: "Test",
		Priority:    domain.PriorityLow,
		AssigneeID:  "assignee-id",
		CreatorID:   "requester-id",
	}
	created, _ := uc.Create(context.Background(), input)

	// Update status
	newStatus := domain.StatusInProgress
	updated, err := uc.Update(context.Background(), created.ID, domain.UpdateRequestInput{
		Status: &newStatus,
	})
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if updated.Status != domain.StatusInProgress {
		t.Errorf("expected status 'in_progress', got '%s'", updated.Status)
	}
}

func TestUpdateRequest_NotFound(t *testing.T) {
	reqRepo := newMockRequestRepo()
	userRepo := newMockUserRepo()
	uc := usecase.NewRequestUsecase(reqRepo, userRepo)

	newStatus := domain.StatusClosed
	_, err := uc.Update(context.Background(), "nonexistent-id", domain.UpdateRequestInput{
		Status: &newStatus,
	})
	if err != usecase.ErrRequestNotFound {
		t.Errorf("expected request not found error, got: %v", err)
	}
}
