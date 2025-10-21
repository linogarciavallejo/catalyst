import { render, screen, fireEvent } from '@testing-library/react';
import NotificationPanel from '@/components/features/NotificationPanel';

describe('NotificationPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading and empty states', () => {
    const { rerender } = render(
      <NotificationPanel notifications={[]} loading />
    );

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    rerender(<NotificationPanel notifications={[]} />);
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('handles interactions and badge counts', () => {
    const onDismissAll = vi.fn();
    const onNotificationClick = vi.fn();
    const onMarkAsRead = vi.fn();

    render(
      <NotificationPanel
        notifications={[
          {
            id: '1',
            type: 'info',
            title: 'Welcome',
            message: 'Thanks for joining',
            read: false,
            createdAt: new Date('2024-01-01T11:59:00Z'),
          },
          {
            id: '2',
            type: 'success',
            title: 'Complete',
            message: 'Task done',
            read: true,
            createdAt: new Date('2024-01-01T11:58:00Z'),
          },
        ]}
        onDismissAll={onDismissAll}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkAsRead}
        maxVisible={1}
      />
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/1 more notification/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear all'));
    expect(onDismissAll).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Welcome'));
    expect(onMarkAsRead).toHaveBeenCalledWith('1');
    expect(onNotificationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' })
    );
  });

  it('supports action links and read notifications', () => {
    const onNotificationClick = vi.fn();
    const onMarkAsRead = vi.fn();

    render(
      <NotificationPanel
        notifications={[
          {
            id: '1',
            type: 'info',
            title: 'Pending',
            message: 'Waiting...',
            read: false,
            createdAt: new Date('2024-01-01T11:59:00Z'),
            actionUrl: 'https://example.com',
            actionLabel: 'Open',
          },
          {
            id: '2',
            type: 'success',
            title: 'Done',
            message: 'All set',
            read: true,
            createdAt: new Date('2024-01-01T11:58:00Z'),
          },
        ]}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkAsRead}
      />
    );

    fireEvent.click(screen.getByRole('link', { name: /Open/ }));
    expect(onNotificationClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Done'));
    expect(onMarkAsRead).not.toHaveBeenCalled();
    expect(onNotificationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2' })
    );
  });
});
