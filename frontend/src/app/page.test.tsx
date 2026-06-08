import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock the Login component to keep the test simple and focused
jest.mock('../components/Login', () => {
  return function DummyLogin() {
    return <div data-testid="login-mock">Login Form</div>;
  };
});

describe('Home Page', () => {
  it('renders the system status title', () => {
    render(<Home />);
    const heading = screen.getByText('The Calling');
    expect(heading).toBeInTheDocument();
  });
});
