// Package integration holds integration tests and setup code.
package integration

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"backend/internal/adapter/db"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

// TestDBContext contains the container and database connection instances.
type TestDBContext struct {
	DB        *sql.DB
	Container testcontainers.Container
}

// SetupTestDatabase spins up a PostgreSQL container, runs migrations/seeds,
// and returns the database context.
func SetupTestDatabase(ctx context.Context) (*TestDBContext, error) {
	log.Println("Starting PostgreSQL container via Testcontainers...")
	req := testcontainers.ContainerRequest{
		Image:        "postgres:15-alpine",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_USER":     "postgres",
			"POSTGRES_PASSWORD": "password",
			"POSTGRES_DB":       "thecalling_test",
		},
		WaitingFor: wait.ForLog("database system is ready to accept connections").WithStartupTimeout(60 * time.Second),
	}

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to start container: %w", err)
	}

	host, err := container.Host(ctx)
	if err != nil {
		_ = container.Terminate(ctx)
		return nil, fmt.Errorf("failed to get container host: %w", err)
	}

	port, err := container.MappedPort(ctx, "5432")
	if err != nil {
		_ = container.Terminate(ctx)
		return nil, fmt.Errorf("failed to get mapped port: %w", err)
	}

	connStr := fmt.Sprintf("postgres://postgres:password@%s:%s/thecalling_test?sslmode=disable", host, port.Port())
	
	// Establish connection
	sqlDB, err := sql.Open("postgres", connStr)
	if err != nil {
		_ = container.Terminate(ctx)
		return nil, fmt.Errorf("failed to open sql connection: %w", err)
	}

	// Wait for ping
	var pingErr error
	for i := 0; i < 10; i++ {
		if pingErr = sqlDB.Ping(); pingErr == nil {
			break
		}
		time.Sleep(1 * time.Second)
	}
	if pingErr != nil {
		_ = sqlDB.Close()
		_ = container.Terminate(ctx)
		return nil, fmt.Errorf("failed to ping database: %w", pingErr)
	}

	// Run migrations and seeds
	if err := db.MigrateAndSeed(sqlDB); err != nil {
		_ = sqlDB.Close()
		_ = container.Terminate(ctx)
		return nil, fmt.Errorf("failed to migrate and seed: %w", err)
	}

	return &TestDBContext{
		DB:        sqlDB,
		Container: container,
	}, nil
}

// Teardown closes the database connection and terminates the container.
func (c *TestDBContext) Teardown(ctx context.Context) {
	if c.DB != nil {
		_ = c.DB.Close()
	}
	if c.Container != nil {
		if err := c.Container.Terminate(ctx); err != nil {
			log.Printf("Warning: failed to terminate container: %v", err)
		}
	}
}
