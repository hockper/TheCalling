// Package repository provides the data access layer for the request module.
package repository

import (
	"context"
	"database/sql"

	"backend/internal/domain"
)

// PostgresUserRepository implements domain.UserRepository using PostgreSQL.
type PostgresUserRepository struct {
	db *sql.DB
}

// NewPostgresUserRepository creates a new PostgresUserRepository.
func NewPostgresUserRepository(db *sql.DB) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

// GetByID retrieves a user by their ID.
func (r *PostgresUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, name, email, password_hash, role, created_at
		FROM users
		WHERE id = $1
	`

	var user domain.User
	var role string
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&role,
		&user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	user.Role = domain.Role(role)
	return &user, nil
}

// GetByEmail retrieves a user by their email address.
func (r *PostgresUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, name, email, password_hash, role, created_at
		FROM users
		WHERE email = $1
	`

	var user domain.User
	var role string
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&role,
		&user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	user.Role = domain.Role(role)
	return &user, nil
}

// List retrieves users optionally filtered by role.
func (r *PostgresUserRepository) List(ctx context.Context, role string) ([]*domain.User, error) {
	var query string
	var args []interface{}
	if role != "" {
		query = `
			SELECT id, name, email, password_hash, role, created_at
			FROM users
			WHERE role = $1
			ORDER BY name ASC
		`
		args = append(args, role)
	} else {
		query = `
			SELECT id, name, email, password_hash, role, created_at
			FROM users
			ORDER BY name ASC
		`
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }() //nolint:errcheck

	var users []*domain.User
	for rows.Next() {
		var user domain.User
		var roleStr string
		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.PasswordHash,
			&roleStr,
			&user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		user.Role = domain.Role(roleStr)
		users = append(users, &user)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

