package domain

import (
	"testing"
)

func TestPriority_IsValid(t *testing.T) {
	// Arrange
	tests := []struct {
		name     string
		priority Priority
		expected bool
	}{
		{"valid low", PriorityLow, true},
		{"valid medium", PriorityMedium, true},
		{"valid high", PriorityHigh, true},
		{"invalid empty", Priority(""), false},
		{"invalid value", Priority("critical"), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Act
			result := tt.priority.IsValid()

			// Assert
			if result != tt.expected {
				t.Errorf("expected IsValid() to return %v for priority %q, got %v", tt.expected, tt.priority, result)
			}
		})
	}
}

func TestStatus_IsValid(t *testing.T) {
	// Arrange
	tests := []struct {
		name     string
		status   Status
		expected bool
	}{
		{"valid open", StatusOpen, true},
		{"valid in progress", StatusInProgress, true},
		{"valid resolved", StatusResolved, true},
		{"valid closed", StatusClosed, true},
		{"invalid empty", Status(""), false},
		{"invalid value", Status("cancelled"), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Act
			result := tt.status.IsValid()

			// Assert
			if result != tt.expected {
				t.Errorf("expected IsValid() to return %v for status %q, got %v", tt.expected, tt.status, result)
			}
		})
	}
}
