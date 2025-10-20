import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Alert } from '@/components/ui/Alert';

describe('Alert', () => {
  it('renders info alerts with default styling', () => {
    render(<Alert>Heads up!</Alert>);

    const text = screen.getByText('Heads up!');
    let root: HTMLElement | null = text;
    while (root && !root.className.includes('rounded-md')) {
      root = root.parentElement;
    }

    expect(root?.className).toContain('bg-blue-50');
    expect(root?.className).toContain('border-l-4');
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('supports titles, close behaviour, and variant classes', () => {
    const onClose = vi.fn();
    render(
      <Alert type="error" title="Something failed" closeable onClose={onClose}>
        Please try again later.
      </Alert>,
    );

    const title = screen.getByText('Something failed');
    expect(title.tagName.toLowerCase()).toBe('h3');

    const text = screen.getByText('Please try again later.');
    let root: HTMLElement | null = text;
    while (root && !root.className.includes('rounded-md')) {
      root = root.parentElement;
    }

    expect(root?.className).toContain('bg-red-50');
    expect(root?.className).toContain('border-red-500');

    const close = screen.getByRole('button', { name: /close alert/i });
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByText('Please try again later.')).not.toBeInTheDocument();
  });
});
