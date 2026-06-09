package integration

import (
	"context"
	"testing"

	"backend/internal/adapter/db"
	"backend/internal/domain"
	"backend/internal/request/repository"

	"github.com/stretchr/testify/assert"
)

func TestPostgresRequestRepository_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	// Arrange: start Testcontainers Postgres
	ctx := context.Background()
	testDB, err := SetupTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to setup test database: %v", err)
	}
	defer testDB.Teardown(ctx)

	repo := repository.NewPostgresRequestRepository(testDB.DB)

	handlerID := "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
	requesterID := "b2c3d4e5-f6a7-8901-bcde-f12345678901"

	t.Run("should create and retrieve requests successfully", func(t *testing.T) {
		// Clean before test
		err := db.CleanDatabase(testDB.DB)
		assert.NoError(t, err)

		// Insert seed users since they're deleted by CleanDatabase
		_, err = testDB.DB.Exec(`
			INSERT INTO users (id, name, email, password_hash, role)
			VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alice Handler', 'handler@thecalling.com', 'hash', 'handler'),
			       ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bob Requester', 'requester@thecalling.com', 'hash', 'requester');
		`)
		assert.NoError(t, err)

		// Create request
		req := &domain.ServiceRequest{
			Title:       "Integration Test Request",
			Description: "This request checks db insertion",
			Priority:    domain.PriorityHigh,
			CreatorID:   requesterID,
			AssigneeID:  &handlerID,
		}

		err = repo.Create(ctx, req)
		assert.NoError(t, err)
		assert.NotEmpty(t, req.ID)

		// Retrieve request
		retrieved, err := repo.GetByID(ctx, req.ID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieved)
		assert.Equal(t, "Integration Test Request", retrieved.Title)
		assert.Equal(t, domain.StatusOpen, retrieved.Status)
		assert.Equal(t, requesterID, retrieved.CreatorID)
		assert.Equal(t, handlerID, *retrieved.AssigneeID)
	})

	t.Run("should find handler with fewest requests", func(t *testing.T) {
		// Clean before test
		err := db.CleanDatabase(testDB.DB)
		assert.NoError(t, err)

		// Insert two handlers and one requester
		_, err = testDB.DB.Exec(`
			INSERT INTO users (id, name, email, password_hash, role)
			VALUES ('00000000-0000-0000-0000-000000000001', 'Handler One', 'h1@test.com', 'hash', 'handler'),
			       ('00000000-0000-0000-0000-000000000002', 'Handler Two', 'h2@test.com', 'hash', 'handler'),
			       ('00000000-0000-0000-0000-000000000003', 'Requester', 'r1@test.com', 'hash', 'requester');
		`)
		assert.NoError(t, err)

		// Initially, either can be chosen (no active requests)
		handler, err := repo.GetHandlerWithFewestRequests(ctx)
		assert.NoError(t, err)
		assert.Contains(t, []string{"00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002"}, handler)

		// Create a request and assign to handler 1
		h1 := "00000000-0000-0000-0000-000000000001"
		req1 := &domain.ServiceRequest{
			Title:       "Req 1",
			Description: "Desc",
			Priority:    domain.PriorityLow,
			CreatorID:   "00000000-0000-0000-0000-000000000003",
			AssigneeID:  &h1,
		}
		err = repo.Create(ctx, req1)
		assert.NoError(t, err)

		// Now, handler 2 should have fewest requests (h-1 has 1 open, h-2 has 0)
		handler, err = repo.GetHandlerWithFewestRequests(ctx)
		assert.NoError(t, err)
		assert.Equal(t, "00000000-0000-0000-0000-000000000002", handler)
	})

	t.Run("should update status and priority", func(t *testing.T) {
		// Clean before test
		err := db.CleanDatabase(testDB.DB)
		assert.NoError(t, err)

		_, err = testDB.DB.Exec(`
			INSERT INTO users (id, name, email, password_hash, role)
			VALUES ('00000000-0000-0000-0000-000000000001', 'Handler One', 'h1@test.com', 'hash', 'handler'),
			       ('00000000-0000-0000-0000-000000000003', 'Requester', 'r1@test.com', 'hash', 'requester');
		`)
		assert.NoError(t, err)

		h1 := "00000000-0000-0000-0000-000000000001"
		req := &domain.ServiceRequest{
			Title:       "Initial Title",
			Description: "Desc",
			Priority:    domain.PriorityLow,
			CreatorID:   "00000000-0000-0000-0000-000000000003",
			AssigneeID:  &h1,
		}
		err = repo.Create(ctx, req)
		assert.NoError(t, err)

		newPriority := domain.PriorityHigh
		newStatus := domain.StatusInProgress
		updateInput := domain.UpdateRequestInput{
			Priority: &newPriority,
			Status:   &newStatus,
		}

		updated, err := repo.Update(ctx, req.ID, updateInput)
		assert.NoError(t, err)
		assert.NotNil(t, updated)
		assert.Equal(t, domain.PriorityHigh, updated.Priority)
		assert.Equal(t, domain.StatusInProgress, updated.Status)
	})

	t.Run("should list requests with filtering and pagination", func(t *testing.T) {
		// Clean before test
		err := db.CleanDatabase(testDB.DB)
		assert.NoError(t, err)

		// Insert users
		_, err = testDB.DB.Exec(`
			INSERT INTO users (id, name, email, password_hash, role)
			VALUES ('00000000-0000-0000-0000-000000000001', 'Handler One', 'h1@test.com', 'hash', 'handler'),
			       ('00000000-0000-0000-0000-000000000002', 'Handler Two', 'h2@test.com', 'hash', 'handler'),
			       ('00000000-0000-0000-0000-000000000003', 'Requester One', 'r1@test.com', 'hash', 'requester'),
			       ('00000000-0000-0000-0000-000000000004', 'Requester Two', 'r2@test.com', 'hash', 'requester');
		`)
		assert.NoError(t, err)

		h1 := "00000000-0000-0000-0000-000000000001"
		h2 := "00000000-0000-0000-0000-000000000002"
		r1 := "00000000-0000-0000-0000-000000000003"
		r2 := "00000000-0000-0000-0000-000000000004"

		// Create 3 requests
		req1 := &domain.ServiceRequest{Title: "Req 1", CreatorID: r1, AssigneeID: &h1, Priority: domain.PriorityLow}
		req2 := &domain.ServiceRequest{Title: "Req 2", CreatorID: r1, AssigneeID: &h2, Priority: domain.PriorityMedium}
		req3 := &domain.ServiceRequest{Title: "Req 3", CreatorID: r2, AssigneeID: &h1, Priority: domain.PriorityHigh}

		err = repo.Create(ctx, req1)
		assert.NoError(t, err)
		err = repo.Create(ctx, req2)
		assert.NoError(t, err)
		err = repo.Create(ctx, req3)
		assert.NoError(t, err)

		// 1. List all
		list, err := repo.List(ctx, domain.ListRequestsFilter{Limit: 10, Offset: 0})
		assert.NoError(t, err)
		assert.Equal(t, 3, list.Total)
		assert.Len(t, list.Data, 3)

		// 2. Filter by creator
		list, err = repo.List(ctx, domain.ListRequestsFilter{CreatorID: &r1, Limit: 10, Offset: 0})
		assert.NoError(t, err)
		assert.Equal(t, 2, list.Total)
		assert.Len(t, list.Data, 2)

		// 3. Filter by assignee
		list, err = repo.List(ctx, domain.ListRequestsFilter{AssigneeID: &h1, Limit: 10, Offset: 0})
		assert.NoError(t, err)
		assert.Equal(t, 2, list.Total)
		assert.Len(t, list.Data, 2)

		// 4. Pagination
		list, err = repo.List(ctx, domain.ListRequestsFilter{Limit: 1, Offset: 1})
		assert.NoError(t, err)
		assert.Equal(t, 3, list.Total)
		assert.Len(t, list.Data, 1)
	})
}
