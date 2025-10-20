import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children and variant styles', () => {
    render(<Button variant="success">Submit</Button>);

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-green-600');
  });

  it('disables interaction while loading and shows spinner', () => {
    render(
      <Button variant="primary" isLoading>
        Loading
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeTruthy();
  });

  it('supports icons on either side', () => {
    const { rerender } = render(
      <Button icon={<span data-testid="icon">★</span>}>Star</Button>
    );

    const leftIcon = screen.getByTestId('icon');
    expect(leftIcon.parentElement?.previousSibling).toBeNull();

    rerender(
      <Button iconPosition="right" icon={<span data-testid="icon">★</span>}>
        Star
      </Button>
    );

    const button = screen.getByRole('button', { name: /star/i });
    expect(button).toBeInTheDocument();
    const rightIcon = screen.getByTestId('icon');
    expect(rightIcon.parentElement?.previousSibling).not.toBeNull();
  });
});
