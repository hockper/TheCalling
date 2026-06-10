// Package db manages the database connection and migrations.
package db

import (
	"database/sql"
	"log"
)

// MigrateAndSeed runs migrations and seeds on the provided DB instance.
func MigrateAndSeed(db *sql.DB) error {
	log.Println("Running migrations for test database...")
	if err := runMigrations(db); err != nil {
		return err
	}
	log.Println("Running seeds for test database...")
	if err := runSeeds(db); err != nil {
		return err
	}
	return nil
}

// CleanDatabase truncates all tables to ensure zero data leakage between integration tests.
func CleanDatabase(db *sql.DB) error {
	log.Println("Cleaning database tables...")
	_, err := db.Exec("TRUNCATE TABLE service_requests, users CASCADE;")
	return err
}
