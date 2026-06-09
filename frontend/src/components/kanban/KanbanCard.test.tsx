import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KanbanCard } from './KanbanCard';
import type { ServiceRequest } from '../../services/api/model/serviceRequest';

describe('KanbanCard Component', () => {
  const mockRequest: ServiceRequest = {
    id: '1',
    title: 'Test Card Title',
    description: 'This is a test description of the card',
    priority: 'high',
    status: 'open',
    created_at: '2026-06-09T14:58:44-03:00',
  };

  test('should render card details', () => {
    // Arrange & Act
    render(
      <KanbanCard
        request={mockRequest}
        onDragStart={() => {}}
        onClick={() => {}}
        assigneeName="Alice Handler"
      />
    );

    // Assert
    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test description of the card')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Alice Handler')).toBeInTheDocument();
  });

  test('should fire click event callback', () => {
    // Arrange
    const handleClick = vi.fn();
    render(
      <KanbanCard
        request={mockRequest}
        onDragStart={() => {}}
        onClick={handleClick}
      />
    );

    // Act
    fireEvent.click(screen.getByRole('heading', { name: 'Test Card Title' }).parentElement!);

    // Assert
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
