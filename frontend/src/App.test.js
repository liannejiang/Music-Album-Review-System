import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MARS heading', () => {
  render(<App />);
  const heading = screen.getByText(/Music Album Review System/i);
  expect(heading).toBeInTheDocument();
});
