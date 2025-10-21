import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders label, help text, and icon', () => {
    render(
      <Input
        label="Email"
        helpText="We will never share it"
        icon={<span data-testid="icon">@</span>}
        placeholder="example@test.com"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('example@test.com')
    ).toBeInTheDocument();
    expect(screen.getByText('We will never share it')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('reports validation errors once touched', () => {
    const { rerender } = render(
      <Input label="Name" value="" onChange={() => {}} error="Required" />
    );

    expect(screen.getByText('Required')).toBeInTheDocument();

    rerender(
      <Input label="Name" value="" onChange={() => {}} helpText="Optional" />
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('calls change handler', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Type" onChange={handleChange} />);

    fireEvent.change(screen.getByPlaceholderText('Type'), {
      target: { value: 'hello' },
    });

    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'hello' }),
    }));
  });
});
