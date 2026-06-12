import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import HandlerDashboardPage from './page';
import { getApiRequests, listUsers } from '../../../services/api';
import { useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock API services
vi.mock('../../../services/api', () => ({
  getApiRequests: vi.fn(),
  updateRequest: vi.fn(),
  listUsers: vi.fn(),
}));

// Mock KanbanBoard to simplify tests
vi.mock('../../../components/kanban/KanbanBoard', () => ({
  KanbanBoard: ({ onCardClick }: any) => (
    <div data-testid="kanban-board">
      <button onClick={() => onCardClick('req-1')} data-testid="card-click-trigger">
        Trigger Card Click
      </button>
    </div>
  ),
}));

// Mock RequestDetailModal to simplify tests
vi.mock('../../../components/RequestDetailModal', () => ({
  RequestDetailModal: ({ onClose }: any) => (
    <div data-testid="request-detail-modal">
      <button onClick={onClose} data-testid="modal-close-trigger">
        Close Modal
      </button>
    </div>
  ),
}));

describe('HandlerDashboardPage', () => {
  let mockPush: any;
  let mockGetRequests: any;
  let mockListUsers: any;

  beforeEach(() => {
    mockPush = vi.fn();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    mockGetRequests = getApiRequests as any;
    mockListUsers = listUsers as any;

    mockListUsers.mockResolvedValue({
      data: [
        { id: 'user-1', name: 'Bob Requester', role: 'requester' },
      ],
    });

    mockGetRequests.mockResolvedValue({
      data: {
        data: [
          { id: 'req-1', title: 'Test Request 1', description: 'Desc 1', priority: 'high', status: 'open', creator_id: 'user-1' },
        ],
        total: 1,
      },
    });
  });

  test('should render Handler Dashboard page', async () => {
    render(<HandlerDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Handler Dashboard')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search requests...')).toBeInTheDocument();
      expect(screen.getByText('Filter by Requester')).toBeInTheDocument();
      expect(screen.getByText('Filter by Priority')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    });
  });

  test('should trigger search api call on debounced search input change', async () => {
    render(<HandlerDashboardPage />);

    const searchInput = screen.getByPlaceholderText('Search requests...');
    fireEvent.change(searchInput, { target: { value: 'login' } });

    // Wait 400ms for debounce to fire
    await new Promise((resolve) => setTimeout(resolve, 400));

    await waitFor(() => {
      expect(mockGetRequests).toHaveBeenCalledWith(expect.objectContaining({ search: 'login' }));
    });
  });

  test('should open details modal when a request card is clicked and close when onClose is fired', async () => {
    render(<HandlerDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('card-click-trigger')).toBeInTheDocument();
    });

    // Modal should not be visible initially
    expect(screen.queryByTestId('request-detail-modal')).not.toBeInTheDocument();

    // Click card to open modal
    fireEvent.click(screen.getByTestId('card-click-trigger'));

    // Modal should be visible
    expect(screen.getByTestId('request-detail-modal')).toBeInTheDocument();

    // Click close trigger
    fireEvent.click(screen.getByTestId('modal-close-trigger'));

    // Modal should be closed
    expect(screen.queryByTestId('request-detail-modal')).not.toBeInTheDocument();
  });
});
