import {
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWindow from '@/components/features/ChatWindow';

const scrollIntoViewSpy = vi.fn();
let originalScrollIntoView: typeof HTMLElement.prototype.scrollIntoView;

describe('ChatWindow', () => {
  beforeAll(() => {
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewSpy,
    });
  });

  afterEach(() => {
    scrollIntoViewSpy.mockClear();
  });

  afterAll(() => {
    if (originalScrollIntoView) {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView,
      });
    } else {
      delete (HTMLElement.prototype as any).scrollIntoView;
    }
  });

  it('renders loading and empty states', () => {
    const { rerender } = render(<ChatWindow messages={[]} loading />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    rerender(<ChatWindow messages={[]} />);
    expect(
      screen.getByText('No messages yet. Start a conversation!')
    ).toBeInTheDocument();
  });

  it('shows messages and sends new message', async () => {
    const onSendMessage = vi.fn().mockResolvedValue(undefined);
    render(
      <ChatWindow
        messages={[
          {
            id: '1',
            content: 'Hello',
            sender: { id: 'a', displayName: 'Alice' },
            timestamp: new Date('2023-12-31T23:59:00Z'),
          },
        ]}
        onSendMessage={onSendMessage}
      />
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText(/ago$/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'New message' } });

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('New message');
    });

    expect((input as HTMLInputElement).value).toBe('');

    fireEvent.change(input, { target: { value: 'Enter message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('Enter message');
    });
  });
});
