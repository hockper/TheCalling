// Package repository provides the data access layer for the request module.
package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"backend/internal/domain"

	"github.com/google/uuid"
)

// PostgresRequestRepository implements domain.RequestRepository using PostgreSQL.
type PostgresRequestRepository struct {
	db *sql.DB
}

// NewPostgresRequestRepository creates a new PostgresRequestRepository.
func NewPostgresRequestRepository(db *sql.DB) *PostgresRequestRepository {
	return &PostgresRequestRepository{db: db}
}

// Create inserts a new service request into the database.
func (r *PostgresRequestRepository) Create(ctx context.Context, req *domain.ServiceRequest) error {
	req.ID = uuid.New().String()
	req.Status = domain.StatusOpen
	req.CreatedAt = time.Now().UTC()
	req.UpdatedAt = req.CreatedAt

	query := `
		INSERT INTO service_requests (id, title, description, priority, status, creator_id, assignee_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.ExecContext(ctx, query,
		req.ID,
		req.Title,
		req.Description,
		string(req.Priority),
		string(req.Status),
		req.CreatorID,
		req.AssigneeID,
		req.CreatedAt,
		req.UpdatedAt,
	)
	return err
}

// GetByID retrieves a single service request by its ID.
func (r *PostgresRequestRepository) GetByID(ctx context.Context, id string) (*domain.ServiceRequest, error) {
	query := `
		SELECT id, title, description, priority, status, creator_id, assignee_id, created_at, updated_at
		FROM service_requests
		WHERE id = $1
	`

	var req domain.ServiceRequest
	var priority, status string
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&req.ID,
		&req.Title,
		&req.Description,
		&priority,
		&status,
		&req.CreatorID,
		&req.AssigneeID,
		&req.CreatedAt,
		&req.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	req.Priority = domain.Priority(priority)
	req.Status = domain.Status(status)
	return &req, nil
}

// List retrieves a paginated list of service requests with optional filtering by creator.
func (r *PostgresRequestRepository) List(ctx context.Context, filter domain.ListRequestsFilter) (*domain.RequestListResult, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if filter.CreatorID != nil {
		conditions = append(conditions, fmt.Sprintf("creator_id = $%d", argIdx))
		args = append(args, *filter.CreatorID)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Get total count
	//nolint:gosec // query parts are safely constructed without user input
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM service_requests %s", whereClause)
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Get paginated results
	//nolint:gosec // query parts are safely constructed without user input
	dataQuery := fmt.Sprintf(`
		SELECT id, title, description, priority, status, creator_id, assignee_id, created_at, updated_at
		FROM service_requests
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIdx, argIdx+1)

	dataArgs := append(args, filter.Limit, filter.Offset)

	rows, err := r.db.QueryContext(ctx, dataQuery, dataArgs...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }() //nolint:errcheck

	var requests []domain.ServiceRequest
	for rows.Next() {
		var req domain.ServiceRequest
		var priority, status string
		err := rows.Scan(
			&req.ID,
			&req.Title,
			&req.Description,
			&priority,
			&status,
			&req.CreatorID,
			&req.AssigneeID,
			&req.CreatedAt,
			&req.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		req.Priority = domain.Priority(priority)
		req.Status = domain.Status(status)
		requests = append(requests, req)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if requests == nil {
		requests = []domain.ServiceRequest{}
	}

	return &domain.RequestListResult{
		Data:  requests,
		Total: total,
	}, nil
}

// Update modifies an existing service request. Only non-nil fields are updated.
func (r *PostgresRequestRepository) Update(ctx context.Context, id string, input domain.UpdateRequestInput) (*domain.ServiceRequest, error) {
	var setClauses []string
	var args []interface{}
	argIdx := 1

	if input.Title != nil {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", argIdx))
		args = append(args, *input.Title)
		argIdx++
	}
	if input.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argIdx))
		args = append(args, *input.Description)
		argIdx++
	}
	if input.Priority != nil {
		setClauses = append(setClauses, fmt.Sprintf("priority = $%d", argIdx))
		args = append(args, string(*input.Priority))
		argIdx++
	}
	if input.Status != nil {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, string(*input.Status))
		argIdx++
	}
	if input.AssigneeID != nil {
		setClauses = append(setClauses, fmt.Sprintf("assignee_id = $%d", argIdx))
		args = append(args, *input.AssigneeID)
		argIdx++
	}

	if len(setClauses) == 0 {
		return r.GetByID(ctx, id)
	}

	// Always update the updated_at timestamp
	setClauses = append(setClauses, fmt.Sprintf("updated_at = $%d", argIdx))
	args = append(args, time.Now().UTC())
	argIdx++

	// Add the ID as the last argument
	args = append(args, id)

	//nolint:gosec // query parts are safely constructed without user input
	query := fmt.Sprintf(`
		UPDATE service_requests
		SET %s
		WHERE id = $%d
		RETURNING id, title, description, priority, status, creator_id, assignee_id, created_at, updated_at
	`, strings.Join(setClauses, ", "), argIdx)

	var req domain.ServiceRequest
	var priority, status string
	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&req.ID,
		&req.Title,
		&req.Description,
		&priority,
		&status,
		&req.CreatorID,
		&req.AssigneeID,
		&req.CreatedAt,
		&req.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	req.Priority = domain.Priority(priority)
	req.Status = domain.Status(status)
	return &req, nil
}
