import type { FC } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { Form } from '@/components/forms/Form';
import { FormField } from '@/components/forms/FormField';
import { useFormContext } from '@/components/forms/useFormContext';

describe('Form components', () => {
  it('throws when useFormContext is used without Form provider', () => {
    expect(() => renderHook(() => useFormContext())).toThrow(
      'useFormContext must be used within a Form component'
    );
  });

  it('handles value changes, validation, submission, and reset', async () => {
    const handleSubmit = vi.fn();

    const ResetButton: FC = () => {
      const { resetForm } = useFormContext();
      return (
        <button type="button" data-testid="reset" onClick={() => resetForm()}>
          Reset
        </button>
      );
    };

    render(
      <Form initialValues={{ title: '' }} onSubmit={handleSubmit}>
        <FormField
          name="title"
          label="Title"
          placeholder="Idea title"
          validate={(value) => (!value ? 'Required' : undefined)}
        />
        <ResetButton />
        <button type="submit">Save</button>
      </Form>
    );

    const input = screen.getByPlaceholderText('Idea title');

    fireEvent.blur(input);
    expect(screen.getByText('Required')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'New idea' } });
    fireEvent.blur(input);

    expect(screen.queryByText('Required')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save').closest('form')!);
    });

    expect(handleSubmit).toHaveBeenCalledWith({ title: 'New idea' });

    fireEvent.change(input, { target: { value: 'Another' } });
    fireEvent.click(screen.getByTestId('reset'));
    expect((input as HTMLInputElement).value).toBe('');
  });
});
