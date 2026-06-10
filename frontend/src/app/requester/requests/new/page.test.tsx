import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewRequestPage from './page';
import { postApiRequests, listUsers } from '../../../../services/api';
import { useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock API services
vi.mock('../../../../services/api', () => ({
  postApiRequests: vi.fn(),
  listUsers: vi.fn(),
}));

describe('NewRequestPage Component', () => {
  let mockPush: any;
  let mockPostRequest: any;
  let mockListUsers: any;

  beforeEach(() => {
    mockPush = vi.fn();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    mockPostRequest = postApiRequests as any;
    mockListUsers = listUsers as any;

    mockListUsers.mockResolvedValue({
      data: [
        { id: 'handler-1', name: 'Alice Handler', role: 'handler' },
      ],
    });
  });

  test('should render form fields', async () => {
    // Arrange & Act
    render(<NewRequestPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/brief summary of the request/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/detailed description of what you need/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
    });
  });

  test('should display validation errors when fields are empty', async () => {
    // Arrange
    render(<NewRequestPage />);
    const submitBtn = screen.getByRole('button', { name: /submit request/i });

    // Act
    fireEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  test('should call postApiRequests and redirect on successful submit', async () => {
    // Arrange
    mockPostRequest.mockResolvedValue({ data: { id: 'req-123' } });
    render(<NewRequestPage />);

    const titleInput = screen.getByPlaceholderText(/brief summary/i);
    const descInput = screen.getByPlaceholderText(/detailed description/i);
    const submitBtn = screen.getByRole('button', { name: /submit request/i });

    // Act
    fireEvent.change(titleInput, { target: { value: 'Request Title' } });
    fireEvent.change(descInput, { target: { value: 'Detailed explanation of work' } });
    fireEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(mockPostRequest).toHaveBeenCalledWith({
        title: 'Request Title',
        description: 'Detailed explanation of work',
        priority: 'medium',
      });
      expect(mockPush).toHaveBeenCalledWith('/requester/requests');
    });
  });
});
