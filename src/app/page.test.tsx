
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import Home from './page'
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home', () => {
  it('redirects to /dashboard', () => {
    render(<Home />)
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  })
})
