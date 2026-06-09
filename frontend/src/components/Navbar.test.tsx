import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

describe('Navbar Component', () => {
  let mockPush: any;
  let mockLogout: any;

  beforeEach(() => {
    mockPush = vi.fn();
    mockLogout = vi.fn();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    (usePathname as any).mockReturnValue('/requester/requests');
  });

  test('should render brand logo and title', () => {
    // Arrange
    (useAuth as any).mockReturnValue({ user: null, loading: false });

    // Act
    render(<Navbar />);

    // Assert
    expect(screen.getByText('The Calling')).toBeInTheDocument();
  });

  test('should render requester navigation links when logged in as requester', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: { name: 'Alice Requester', role: 'requester', email: 'req@test.com' },
      loading: false,
    });

    // Act
    render(<Navbar />);

    // Assert
    expect(screen.getByRole('button', { name: /my requests/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ new request/i })).toBeInTheDocument();
  });

  test('should render handler navigation links when logged in as handler', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: { name: 'Bob Handler', role: 'handler', email: 'handler@test.com' },
      loading: false,
    });
    (usePathname as any).mockReturnValue('/handler/dashboard');

    // Act
    render(<Navbar />);

    // Assert
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
  });

  test('should call logout and redirect when sign out clicked', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: { name: 'Alice Requester', role: 'requester', email: 'req@test.com' },
      loading: false,
      logout: mockLogout,
    });

    render(<Navbar />);
    const signOutBtn = screen.getByRole('button', { name: /sign out/i });

    // Act
    fireEvent.click(signOutBtn);

    // Assert
    expect(mockLogout).toHaveBeenCalled();
  });
});
