import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KanbanBoard } from './KanbanBoard';
import type { ServiceRequest } from '../../services/api/model/serviceRequest';

describe('KanbanBoard Component', () => {
  const mockRequests: ServiceRequest[] = [
    { id: '1', title: 'Task 1', description: 'Desc 1', status: 'open', priority: 'low' },
    { id: '2', title: 'Task 2', description: 'Desc 2', status: 'in_progress', priority: 'medium' },
  ];

  test('should render all four columns', () => {
    // Arrange & Act
    render(
      <KanbanBoard
        requests={mockRequests}
        onStatusChange={() => {}}
        onCardClick={() => {}}
      />
    );

    // Assert
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  test('should group requests in their respective columns', () => {
    // Arrange & Act
    render(
      <KanbanBoard
        requests={mockRequests}
        onStatusChange={() => {}}
        onCardClick={() => {}}
      />
    );

    // Assert
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('should trigger status change callback on drop', () => {
    // Arrange
    const onStatusChangeMock = vi.fn();
    render(
      <KanbanBoard
        requests={mockRequests}
        onStatusChange={onStatusChangeMock}
        onCardClick={() => {}}
      />
    );

    const card = screen.getByText('Task 1').closest('div');
    const inProgressColumn = screen.getByText('In Progress').closest('div');

    expect(card).not.toBeNull();
    expect(inProgressColumn).not.toBeNull();

    // Act & Assert
    const dataTransfer = {
      setData: vi.fn(),
      getData: () => '1',
    };

    fireEvent.dragStart(card!, { dataTransfer });
    fireEvent.dragOver(inProgressColumn!, { dataTransfer });
    fireEvent.drop(inProgressColumn!, { dataTransfer });

    expect(onStatusChangeMock).toHaveBeenCalledWith('1', 'in_progress');
  });
});
