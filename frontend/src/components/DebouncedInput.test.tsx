import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DebouncedInput } from './DebouncedInput';

describe('DebouncedInput', () => {
  it('should render input with value', () => {
    render(<DebouncedInput value="test" onChange={() => {}} placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('test');
  });

  it('should call onChange after delay', async () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();
    render(<DebouncedInput value="" onChange={handleChange} placeholder="Search..." debounce={300} />);
    
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'hello' } });

    // Should not call onChange immediately
    expect(handleChange).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(handleChange).toHaveBeenCalledWith('hello');
    vi.useRealTimers();
  });
});
