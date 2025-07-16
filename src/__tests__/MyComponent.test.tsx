import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

test('εμφανίζει το κουμπί', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button', { name: /πατήστε με/i })).toBeInTheDocument();
});
