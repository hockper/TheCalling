import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KanbanColumn } from './KanbanColumn';
import type { ServiceRequest } from '../../services/api/model/serviceRequest';

describe('KanbanColumn Component', () => {
  const mockRequests: ServiceRequest[] = [
    { id: '1', title: 'Task 1', description: 'Desc 1', status: 'open', priority: 'low' },
  ];

  test('should render column title and badge count', () => {
    // Arrange & Act
    render(
      <KanbanColumn
        title="Open"
        status="open"
        requests={mockRequests}
        onDragStart={() => {}}
        onDragOver={() => {}}
        onDrop={() => {}}
        onCardClick={() => {}}
      />
    );

    // Assert
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  test('should show empty state message when no requests', () => {
    // Arrange & Act
    render(
      <KanbanColumn
        title="Open"
        status="open"
        requests={[]}
        onDragStart={() => {}}
        onDragOver={() => {}}
        onDrop={() => {}}
        onCardClick={() => {}}
      />
    );

    // Assert
    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});
