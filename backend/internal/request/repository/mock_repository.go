// Package repository provides repository implementations and test mocks.
package repository

import (
	"context"

	"backend/internal/domain"

	"github.com/stretchr/testify/mock"
)

// MockRequestRepository is a testify mock implementation of RequestRepository.
type MockRequestRepository struct {
	mock.Mock
}

func (m *MockRequestRepository) Create(ctx context.Context, req *domain.ServiceRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockRequestRepository) GetByID(ctx context.Context, id string) (*domain.ServiceRequest, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ServiceRequest), args.Error(1)
}

func (m *MockRequestRepository) List(ctx context.Context, filter domain.ListRequestsFilter) (*domain.RequestListResult, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.RequestListResult), args.Error(1)
}

func (m *MockRequestRepository) Update(ctx context.Context, id string, input domain.UpdateRequestInput) (*domain.ServiceRequest, error) {
	args := m.Called(ctx, id, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ServiceRequest), args.Error(1)
}

func (m *MockRequestRepository) GetHandlerWithFewestRequests(ctx context.Context) (string, error) {
	args := m.Called(ctx)
	return args.String(0), args.Error(1)
}

// MockUserRepository is a testify mock implementation of UserRepository.
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) List(ctx context.Context, role string) ([]*domain.User, error) {
	args := m.Called(ctx, role)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.User), args.Error(1)
}
