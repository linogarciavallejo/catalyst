import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Layout/Header';

vi.mock('@/components/features/ConnectionIndicator', () => ({
  default: () => <div data-testid="connection-indicator" />,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo, title, children and actions', () => {
    render(
      <Header
        logo={<span data-testid="logo">Logo</span>}
        title="Catalyst"
        actions={<button type="button">Action</button>}
      >
        <span data-testid="child">Child</span>
      </Header>,
    );

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByText('Catalyst')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toBeInTheDocument();
  });

  it('applies sticky classes by default', () => {
    const { container } = render(<Header title="Sticky" />);
    expect(container.firstChild).toHaveClass('sticky');
    expect(container.firstChild).toHaveClass('top-0');
  });

  it('can disable sticky behavior and accept additional class names', () => {
    const { container } = render(
      <Header title="Not Sticky" sticky={false} className="custom" />,
    );
    expect(container.firstChild).not.toHaveClass('sticky');
    expect(container.firstChild).toHaveClass('custom');
  });
});
