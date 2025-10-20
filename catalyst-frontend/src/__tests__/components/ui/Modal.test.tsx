import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('returns null when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        Hidden
      </Modal>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders content and handles close interactions', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="Welcome">
        <p>Body</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledTimes(2);

    rerender(
      <Modal isOpen={false} onClose={onClose}>
        Closed
      </Modal>
    );

    expect(document.body.style.overflow).toBe('unset');
  });
});
