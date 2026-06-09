// Package db manages the database connection and migrations.
package db

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

func TestMigrateAndSeed_Error(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer func() { _ = db.Close() }()

	// Mock failure on the first migration query
	mock.ExpectExec("CREATE TABLE").WillReturnError(assert.AnError)

	err = MigrateAndSeed(db)
	assert.Error(t, err)
}

func TestCleanDatabase_Error(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer func() { _ = db.Close() }()

	mock.ExpectExec("TRUNCATE TABLE").WillReturnError(assert.AnError)

	err = CleanDatabase(db)
	assert.Error(t, err)
}
