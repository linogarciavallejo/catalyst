import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Layout/Footer';

describe('Footer', () => {
  it('renders default copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/Catalyst/)).toBeInTheDocument();
  });

  it('allows overriding props and class names', () => {
    const { container } = render(
      <Footer copyright="Custom" className="extra" data-testid="footer" />,
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('extra');
  });
});
