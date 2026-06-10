// Package domain provides core business models and interfaces.
package domain

import (
	"context"
	"time"
)

// Priority represents the priority level of a service request.
type Priority string

// Priority constants defining urgency of requests.
const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

// IsValid checks if the priority value is valid.
func (p Priority) IsValid() bool {
	switch p {
	case PriorityLow, PriorityMedium, PriorityHigh:
		return true
	}
	return false
}

// Status represents the lifecycle state of a service request.
type Status string

// Status constants defining the lifecycle state of requests.
const (
	StatusOpen       Status = "open"
	StatusInProgress Status = "in_progress"
	StatusResolved   Status = "resolved"
	StatusClosed     Status = "closed"
)

// IsValid checks if the status value is valid.
func (s Status) IsValid() bool {
	switch s {
	case StatusOpen, StatusInProgress, StatusResolved, StatusClosed:
		return true
	}
	return false
}

// Role represents the user role in the system.
type Role string

// Role constants defining user permissions.
const (
	RoleRequester Role = "requester"
	RoleHandler   Role = "handler"
)

// User represents a person in the system.
type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         Role      `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

// ServiceRequest represents a task, issue, or job in the system.
type ServiceRequest struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Priority    Priority  `json:"priority"`
	Status      Status    `json:"status"`
	CreatorID   string    `json:"creator_id"`
	AssigneeID  *string   `json:"assignee_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateRequestInput holds the data needed to create a new service request.
type CreateRequestInput struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Priority    Priority `json:"priority"`
	AssigneeID  string   `json:"assignee_id,omitempty"`
	CreatorID   string   // Set by the system, not by the user
}

// UpdateRequestInput holds the data to update an existing service request.
type UpdateRequestInput struct {
	Title       *string   `json:"title,omitempty"`
	Description *string   `json:"description,omitempty"`
	Priority    *Priority `json:"priority,omitempty"`
	Status      *Status   `json:"status,omitempty"`
	AssigneeID  *string   `json:"assignee_id,omitempty"`
}

// ListRequestsFilter holds pagination and filtering parameters for listing requests.
type ListRequestsFilter struct {
	Limit      int
	Offset     int
	CreatorID  *string // If set, only returns requests from this creator
	AssigneeID *string // If set, only returns requests assigned to this user
	Scope      string  // "me" or "all"
}

// RequestListResult holds a paginated list of service requests and the total count.
type RequestListResult struct {
	Data  []ServiceRequest `json:"data"`
	Total int              `json:"total"`
}

// RequestRepository defines the data access interface for service requests.
type RequestRepository interface {
	Create(ctx context.Context, req *ServiceRequest) error
	GetByID(ctx context.Context, id string) (*ServiceRequest, error)
	List(ctx context.Context, filter ListRequestsFilter) (*RequestListResult, error)
	Update(ctx context.Context, id string, input UpdateRequestInput) (*ServiceRequest, error)
	GetHandlerWithFewestRequests(ctx context.Context) (string, error)
}

// UserRepository defines the data access interface for users.
type UserRepository interface {
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	List(ctx context.Context, role string) ([]*User, error)
}

// RequestUsecase defines the business logic interface for service requests.
type RequestUsecase interface {
	Create(ctx context.Context, input CreateRequestInput) (*ServiceRequest, error)
	GetByID(ctx context.Context, id string, userID string, userRole string) (*ServiceRequest, error)
	List(ctx context.Context, filter ListRequestsFilter, userRole string) (*RequestListResult, error)
	Update(ctx context.Context, id string, input UpdateRequestInput) (*ServiceRequest, error)
}
