import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionIndicator from '@/components/features/ConnectionIndicator';
import { useConnectionState } from '@/hooks/useConnectionState';

vi.mock('@/hooks/useConnectionState', () => ({
  useConnectionState: vi.fn(),
}));

const mockUseConnectionState = useConnectionState as unknown as vi.MockedFunction<
  typeof useConnectionState
>;

describe('ConnectionIndicator', () => {
  beforeEach(() => {
    mockUseConnectionState.mockReturnValue({
      isConnected: true,
      connectionType: 'websocket',
      reconnectAttempts: 0,
      error: null,
      reconnect: vi.fn(),
    });
  });

  it('renders nothing when connected without errors', () => {
    const { container } = render(<ConnectionIndicator />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows offline state with retry button', () => {
    const reconnect = vi.fn();
    mockUseConnectionState.mockReturnValue({
      isConnected: false,
      connectionType: 'offline',
      reconnectAttempts: 0,
      error: null,
      reconnect,
    });

    render(<ConnectionIndicator />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(reconnect).toHaveBeenCalled();
  });

  it('indicates reconnecting attempts and errors', () => {
    mockUseConnectionState.mockReturnValue({
      isConnected: false,
      connectionType: 'websocket',
      reconnectAttempts: 2,
      error: null,
      reconnect: vi.fn(),
    });

    const { rerender } = render(<ConnectionIndicator />);
    expect(
      screen.getByText(/Reconnecting... \(Attempt 2\)/)
    ).toBeInTheDocument();

    mockUseConnectionState.mockReturnValue({
      isConnected: false,
      connectionType: 'websocket',
      reconnectAttempts: 0,
      error: 'Connection lost',
      reconnect: vi.fn(),
    });

    rerender(<ConnectionIndicator />);
    expect(screen.getByText('Connection lost')).toBeInTheDocument();
  });
});
