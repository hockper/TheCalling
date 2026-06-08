package cache

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

func InitRedis(url string) (*redis.Client, error) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}

	rdb := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Retry redis connection setup to handle startup delays
	for i := 0; i < 10; i++ {
		_, err = rdb.Ping(ctx).Result()
		if err == nil {
			log.Println("Successfully connected to Redis")
			return rdb, nil
		}

		log.Printf("Redis not ready yet (attempt %d/10): %v. Retrying in 2 seconds...", i+1, err)
		time.Sleep(2 * time.Second)
	}

	return nil, err
}
