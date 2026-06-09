import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { useAuth } from '../context/AuthContext';

// Mock the useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Component', () => {
  let mockLogin: any;

  beforeEach(() => {
    mockLogin = vi.fn();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
    });
  });

  test('should render email and password inputs', () => {
    // Arrange & Act
    render(<Login />);

    // Assert
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('should update inputs on user typing', () => {
    // Arrange
    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Act
    fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Assert
    expect(emailInput).toHaveValue('test@user.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('should call login when form is submitted', async () => {
    // Arrange
    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    // Act
    fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@user.com',
        password: 'password123',
      });
    });
  });

  test('should display error message on login failure', async () => {
    // Arrange
    mockLogin.mockRejectedValue(new Error('Invalid email or password'));
    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    // Act
    fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
