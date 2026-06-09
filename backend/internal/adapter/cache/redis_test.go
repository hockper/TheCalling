// Package cache provides caching functionality.
package cache

import (
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/stretchr/testify/assert"
)

func TestInitRedis(t *testing.T) {
	t.Run("should connect to miniredis successfully", func(t *testing.T) {
		mr, err := miniredis.Run()
		assert.NoError(t, err)
		defer mr.Close()

		url := "redis://" + mr.Addr()
		rdb, err := InitRedis(url)
		assert.NoError(t, err)
		assert.NotNil(t, rdb)
		_ = rdb.Close()
	})

	t.Run("should fail with invalid url", func(t *testing.T) {
		_, err := InitRedis("invalid-url")
		assert.Error(t, err)
	})
}
