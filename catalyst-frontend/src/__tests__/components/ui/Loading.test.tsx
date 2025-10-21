import { render, screen } from '@testing-library/react';
import { Loading, Spinner, Skeleton } from '@/components/ui/Loading';

describe('Loading utilities', () => {
  it('shows spinner when loading is true and children when false', () => {
    const { rerender } = render(
      <Loading isLoading>
        <p data-testid="content">Ready</p>
      </Loading>
    );

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    rerender(
      <Loading isLoading={false}>
        <p data-testid="content">Ready</p>
      </Loading>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders spinner with size-specific classes', () => {
    const { container } = render(<Spinner size="xl" className="custom" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('w-12', 'h-12');
    expect(spinner).toHaveClass('custom');
  });

  it('renders skeleton with circle support', () => {
    const { container } = render(<Skeleton circle width="w-10" height="h-10" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('rounded-full');
    expect(skeleton.className).toContain('w-10');
    expect(skeleton.className).toContain('h-10');
  });

  it('applies default spinner size and skeleton shape when props omitted', () => {
    const { container, rerender } = render(<Spinner />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('w-6', 'h-6');

    rerender(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('rounded-md');
  });
});
