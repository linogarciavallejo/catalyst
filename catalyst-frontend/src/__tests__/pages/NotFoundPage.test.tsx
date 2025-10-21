import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';
import '@testing-library/jest-dom';

describe('NotFoundPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

  it('displays the 404 messaging and navigation shortcuts', () => {
    renderPage();

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Browse Ideas' })).toHaveAttribute('href', '/ideas');
    expect(screen.getByRole('link', { name: /Back to Home/ })).toHaveAttribute('href', '/');
  });
});
