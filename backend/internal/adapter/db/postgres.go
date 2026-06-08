// Package db manages the database connection and migrations.
package db

import (
	"database/sql"
	"embed"
	"log"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver required for database/sql
)

//go:embed migrations/*.sql
var migrationFS embed.FS

//go:embed seeds/*.sql
var seedFS embed.FS

// InitDB establishes a connection to PostgreSQL with retry logic,
// then runs migrations and seeds.
func InitDB(connStr string) (*sql.DB, error) {
	var db *sql.DB
	var err error

	// Retry database connection setup to handle database startup delays
	for i := 0; i < 10; i++ {
		db, err = sql.Open("postgres", connStr)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Successfully connected to database")

				// Run migrations
				if migErr := runMigrations(db); migErr != nil {
					log.Printf("Warning: migration error: %v", migErr)
				}

				// Run seeds
				if seedErr := runSeeds(db); seedErr != nil {
					log.Printf("Warning: seed error: %v", seedErr)
				}

				return db, nil
			}
		}

		log.Printf("Database not ready yet (attempt %d/10): %v. Retrying in 2 seconds...", i+1, err)
		time.Sleep(2 * time.Second)
	}

	return nil, err
}

// runMigrations executes all .up.sql migration files embedded in the binary.
func runMigrations(db *sql.DB) error {
	entries, err := migrationFS.ReadDir("migrations")
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		// Only run .up.sql files
		name := entry.Name()
		if len(name) < 7 || name[len(name)-7:] != ".up.sql" {
			continue
		}

		content, err := migrationFS.ReadFile("migrations/" + name)
		if err != nil {
			return err
		}

		log.Printf("Running migration: %s", name)
		if _, err := db.Exec(string(content)); err != nil {
			return err
		}
		log.Printf("Migration completed: %s", name)
	}

	return nil
}

// runSeeds executes all seed SQL files embedded in the binary.
func runSeeds(db *sql.DB) error {
	entries, err := seedFS.ReadDir("seeds")
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		content, err := seedFS.ReadFile("seeds/" + entry.Name())
		if err != nil {
			return err
		}

		log.Printf("Running seed: %s", entry.Name())
		if _, err := db.Exec(string(content)); err != nil {
			return err
		}
		log.Printf("Seed completed: %s", entry.Name())
	}

	return nil
}
