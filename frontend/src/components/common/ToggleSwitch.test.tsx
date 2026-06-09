import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToggleSwitch } from './ToggleSwitch';

describe('ToggleSwitch Component', () => {
  test('should render label when provided', () => {
    // Arrange & Act
    render(<ToggleSwitch checked={false} onChange={() => {}} label="Test Label" />);

    // Assert
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('should reflect correct checked state', () => {
    // Arrange & Act
    render(<ToggleSwitch checked={true} onChange={() => {}} label="Toggle" />);
    const checkbox = screen.getByRole('checkbox');

    // Assert
    expect(checkbox).toBeChecked();
  });

  test('should fire onChange callback when toggled', () => {
    // Arrange
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} label="Toggle" />);
    const checkbox = screen.getByRole('checkbox');

    // Act
    fireEvent.click(checkbox);

    // Assert
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
