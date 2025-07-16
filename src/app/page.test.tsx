import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from './page'
 
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home', () => {
  it('calls redirect to /dashboard', () => {
    const { redirect } = require('next/navigation');
    render(<Home />)
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  })
})
