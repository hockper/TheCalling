import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
    };
  },
}));

// Mock the Login component to keep the test simple and focused
vi.mock('../components/Login', () => {
  return {
    default: function DummyLogin() {
      return <div data-testid="login-mock">Login Form</div>;
    }
  };
});

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

describe('Home Page', () => {
  it('renders the system status title', () => {
    render(<Home />);
    const heading = screen.getByText('The Calling');
    expect(heading).toBeInTheDocument();
  });
});
