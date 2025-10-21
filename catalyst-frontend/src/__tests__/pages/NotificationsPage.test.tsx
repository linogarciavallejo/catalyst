import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NotificationsPage from '@/pages/NotificationsPage';
import { useNotifications } from '@/hooks';
import type { Notification } from '@/types';
import '@testing-library/jest-dom';

vi.mock('@/hooks', () => ({
  useNotifications: vi.fn(),
}));

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  mockConsoleError.mockRestore();
});

describe('NotificationsPage', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const markAsRead = vi.fn();
  const notifications: Notification[] = [
    {
      id: 'n1',
      userId: 'u1',
      message: 'Idea approved!',
      type: 'IdeaApproved',
      isRead: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'n2',
      userId: 'u1',
      message: 'Someone commented on your idea',
      type: 'IdeaCommented',
      isRead: true,
      createdAt: new Date('2024-01-02T00:00:00Z'),
    },
  ];

  let notificationsReturn: {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    connect: typeof connect;
    disconnect: typeof disconnect;
    markAsRead: typeof markAsRead;
    markAllAsRead: () => void;
    clearAll: () => void;
    clearError: () => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();

    connect.mockResolvedValue(undefined);
    disconnect.mockResolvedValue(undefined);
    markAsRead.mockResolvedValue(undefined);

    notificationsReturn = {
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      isConnected: true,
      isLoading: false,
      error: null,
      connect,
      disconnect,
      markAsRead,
      markAllAsRead: vi.fn(),
      clearAll: vi.fn(),
      clearError: vi.fn(),
    };

    (useNotifications as unknown as vi.Mock).mockImplementation(() => notificationsReturn);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    );

  it('connects on mount and disconnects on unmount', async () => {
    const { unmount } = renderPage();

    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });

    unmount();

    await waitFor(() => {
      expect(disconnect).toHaveBeenCalledTimes(1);
    });
  });

  it('renders notifications and filters unread items', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Idea approved!')).toBeInTheDocument();
    });

    expect(screen.getByText('✓')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Unread/ }));

    expect(screen.getByText('Idea approved!')).toBeInTheDocument();
    expect(screen.queryByText('Someone commented on your idea')).not.toBeInTheDocument();
  });

  it('marks notifications as read and logs failures', async () => {
    const user = userEvent.setup();
    const view = renderPage();

    const markButtons = await screen.findAllByRole('button', { name: 'Mark as read' });
    await user.click(markButtons[0]);

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('n1');
    });

    markAsRead.mockRejectedValueOnce(new Error('Mark failed'));

    notificationsReturn = {
      ...notificationsReturn,
      notifications,
    };

    view.rerender(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    );

    const retryButton = await screen.findAllByRole('button', { name: 'Mark as read' });
    await user.click(retryButton[0]);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to mark notification as read:',
        expect.any(Error)
      );
    });
  });

  it('shows empty state when there are no notifications', async () => {
    notificationsReturn = {
      ...notificationsReturn,
      notifications: [],
      unreadCount: 0,
    };

    renderPage();

    expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
  });

  it('logs connection failures and recovers loading state', async () => {
    connect.mockRejectedValueOnce(new Error('connect exploded'));

    renderPage();

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to connect to notifications:',
        expect.any(Error)
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading notifications...')).not.toBeInTheDocument();
    });
  });

  it('logs disconnect failures during cleanup', async () => {
    disconnect.mockRejectedValueOnce(new Error('disconnect exploded'));

    const view = renderPage();

    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });

    view.unmount();

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to disconnect:',
        expect.any(Error)
      );
    });
  });

  it('maps icons and colors for all notification types', async () => {
    const baseDate = new Date('2024-01-03T00:00:00Z');
    notificationsReturn = {
      ...notificationsReturn,
      notifications: [
        {
          id: 'n3',
          userId: 'u2',
          message: 'Your idea earned a vote',
          type: 'IdeaVoted',
          isRead: false,
          createdAt: baseDate,
        },
        {
          id: 'n4',
          userId: 'u3',
          message: 'New message waiting for you',
          type: 'ChatMessage',
          isRead: false,
          createdAt: new Date(baseDate.getTime() + 1_000),
        },
        {
          id: 'n5',
          userId: 'u4',
          message: 'Something else happened',
          type: 'UnknownType',
          isRead: true,
          createdAt: new Date(baseDate.getTime() + 2_000),
        },
      ],
    };

    (useNotifications as unknown as vi.Mock).mockImplementation(() => notificationsReturn);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('IdeaVoted')).toBeInTheDocument();
      expect(screen.getByText('ChatMessage')).toBeInTheDocument();
      expect(screen.getByText('UnknownType')).toBeInTheDocument();
    });

    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('✉️')).toBeInTheDocument();
    expect(screen.getByText('🔔')).toBeInTheDocument();

    const votedCard = screen.getByText('IdeaVoted').closest('div.p-4');
    expect(votedCard).toHaveClass('bg-purple-50');
    expect(votedCard).toHaveClass('border-purple-200');

    const chatCard = screen.getByText('ChatMessage').closest('div.p-4');
    expect(chatCard).toHaveClass('bg-yellow-50');
    expect(chatCard).toHaveClass('border-yellow-200');

    const fallbackCard = screen.getByText('UnknownType').closest('div.p-4');
    expect(fallbackCard).toHaveClass('bg-gray-50');
    expect(fallbackCard).toHaveClass('border-gray-200');
  });
});
