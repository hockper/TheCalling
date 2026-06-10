package integration

import (
	"context"
	"testing"

	"backend/internal/domain"
	"backend/internal/request/repository"

	"github.com/stretchr/testify/assert"
)

func TestPostgresUserRepository_Integration(t *testing.T) {
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

	repo := repository.NewPostgresUserRepository(testDB.DB)

	t.Run("should retrieve user by ID", func(t *testing.T) {
		// Act
		user, err := repo.GetByID(ctx, "a1b2c3d4-e5f6-7890-abcd-ef1234567890")

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "Alice Handler", user.Name)
		assert.Equal(t, "handler@thecalling.com", user.Email)
		assert.Equal(t, domain.RoleHandler, user.Role)
	})

	t.Run("should retrieve user by email", func(t *testing.T) {
		// Act
		user, err := repo.GetByEmail(ctx, "requester@thecalling.com")

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "b2c3d4e5-f6a7-8901-bcde-f12345678901", user.ID)
		assert.Equal(t, domain.RoleRequester, user.Role)
	})

	t.Run("should list users filtered by role", func(t *testing.T) {
		// Act
		handlers, err := repo.List(ctx, "handler")

		// Assert
		assert.NoError(t, err)
		assert.Len(t, handlers, 3)
		assert.Equal(t, "Alice Handler", handlers[0].Name)
	})

	t.Run("should return nil when user is not found", func(t *testing.T) {
		// Act
		user, err := repo.GetByID(ctx, "00000000-0000-0000-0000-000000000000")

		// Assert
		assert.NoError(t, err)
		assert.Nil(t, user)
	})
}
