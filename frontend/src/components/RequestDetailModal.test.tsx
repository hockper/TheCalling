import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RequestDetailModal } from './RequestDetailModal';
import { getApiRequestById, listUsers } from '../services/api';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('../services/api', () => ({
  getApiRequestById: vi.fn(),
  listUsers: vi.fn(),
}));

describe('RequestDetailModal', () => {
  const mockOnClose = vi.fn();
  const requestId = 'test-request-id-123';

  beforeEach(() => {
    mockOnClose.mockClear();
    vi.mocked(getApiRequestById).mockResolvedValue({
      data: {
        id: requestId,
        title: 'Test Modal Request',
        description: 'Detailed description of modal request',
        priority: 'high',
        status: 'in_progress',
        creator_id: 'creator-1',
        assignee_id: 'assignee-1',
        created_at: '2026-06-12T01:00:00Z',
        updated_at: '2026-06-12T02:00:00Z',
      },
    } as any);

    vi.mocked(listUsers).mockResolvedValue({
      data: [
        { id: 'creator-1', name: 'Alice Creator', email: 'alice@test.com', role: 'requester' },
        { id: 'assignee-1', name: 'Bob Assignee', email: 'bob@test.com', role: 'handler' },
      ],
    } as any);
  });

  test('should render request details and call onClose when Back to Dashboard clicked', async () => {
    render(<RequestDetailModal id={requestId} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Test Modal Request')).toBeInTheDocument();
      expect(screen.getByText('Detailed description of modal request')).toBeInTheDocument();
      expect(screen.getByText('Alice Creator (alice@test.com)')).toBeInTheDocument();
      expect(screen.getByText('Bob Assignee (bob@test.com)')).toBeInTheDocument();
      expect(screen.getAllByText('high')[0]).toBeInTheDocument();
      expect(screen.getAllByText('in progress')[0]).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to Dashboard');
    fireEvent.click(backButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should call onClose when ESC pressed', async () => {
    render(<RequestDetailModal id={requestId} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Test Modal Request')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
