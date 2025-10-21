import { renderHook, act } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import type { Notification } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';

const notificationMocks = vi.hoisted(() => {
  const listeners = new Map<string, (payload?: unknown) => void>();
  const connectMock = vi.fn<[string, string], Promise<void>>();
  const disconnectMock = vi.fn<[], Promise<void>>();
  const markAsReadMock = vi.fn<[string], Promise<void>>();
  const markAllAsReadMock = vi.fn<[], Promise<void>>();
  const onMock = vi.fn((event: string, callback: (payload?: unknown) => void) => {
    listeners.set(event, callback);
  });
  const offMock = vi.fn((event: string, callback: (payload?: unknown) => void) => {
    const current = listeners.get(event);
    if (current === callback) {
      listeners.delete(event);
    }
  });
  const getCurrentUserMock = vi.fn<[], Promise<{ id: string } | null>>();
  const getTokenMock = vi.fn<[], string | null>();

  return {
    connectMock,
    disconnectMock,
    markAsReadMock,
    markAllAsReadMock,
    onMock,
    offMock,
    getCurrentUserMock,
    getTokenMock,
    listeners,
  };
});

vi.mock('@/services', async () => {
  const actual = await vi.importActual<typeof import('@/services')>('@/services');
  return {
    ...actual,
    NotificationsService: {
      connect: (...args: Parameters<typeof notificationMocks.connectMock>) =>
        notificationMocks.connectMock(...args),
      disconnect: (...args: Parameters<typeof notificationMocks.disconnectMock>) =>
        notificationMocks.disconnectMock(...args),
      markAsRead: (...args: Parameters<typeof notificationMocks.markAsReadMock>) =>
        notificationMocks.markAsReadMock(...args),
      markAllAsRead: (...args: Parameters<typeof notificationMocks.markAllAsReadMock>) =>
        notificationMocks.markAllAsReadMock(...args),
      on: notificationMocks.onMock,
      off: notificationMocks.offMock,
    },
    AuthService: {
      getCurrentUser: () => notificationMocks.getCurrentUserMock(),
      getToken: () => notificationMocks.getTokenMock(),
    },
  };
});

describe('useNotifications', () => {
  const baseNotification: Notification = {
    id: 'n-1',
    userId: 'user-1',
    type: 'IdeaVoted' as Notification['type'],
    message: 'Hello',
    isRead: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    notificationMocks.listeners.clear();
    vi.clearAllMocks();
  });

  it('connects and prepends incoming notifications', async () => {
    notificationMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    notificationMocks.getTokenMock.mockReturnValue('token-123');
    notificationMocks.connectMock.mockResolvedValue();

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.connect();
    });

    expect(notificationMocks.connectMock).toHaveBeenCalledWith('user-1', 'token-123');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(notificationMocks.onMock).toHaveBeenCalledTimes(3);

    act(() => {
      notificationMocks.listeners.get('connected')?.();
      notificationMocks.listeners.get('notificationReceived')?.(baseNotification);
    });

    expect(result.current.notifications[0]).toEqual(baseNotification);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.isConnected).toBe(true);

    act(() => {
      notificationMocks.listeners.get('disconnected')?.();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('clears listeners and state when disconnecting', async () => {
    notificationMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    notificationMocks.getTokenMock.mockReturnValue('token-123');
    notificationMocks.connectMock.mockResolvedValue();
    notificationMocks.disconnectMock.mockResolvedValue();

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.connect();
    });

    const registeredHandler = notificationMocks.listeners.get('notificationReceived');

    await act(async () => {
      await result.current.disconnect();
    });

    expect(notificationMocks.disconnectMock).toHaveBeenCalled();
    expect(notificationMocks.offMock).toHaveBeenCalledWith('notificationReceived', registeredHandler);
    expect(result.current.isConnected).toBe(false);
  });

  it('marks notifications as read individually and in batch', async () => {
    notificationMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    notificationMocks.getTokenMock.mockReturnValue('token-123');
    notificationMocks.connectMock.mockResolvedValue();
    notificationMocks.markAsReadMock.mockResolvedValue();
    notificationMocks.markAllAsReadMock.mockResolvedValue();

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.connect();
    });

    act(() => {
      notificationMocks.listeners.get('notificationReceived')?.(baseNotification);
      notificationMocks.listeners
        .get('notificationReceived')?.({ ...baseNotification, id: 'n-2' });
    });

    await act(async () => {
      await result.current.markAsRead('n-1');
    });

    expect(notificationMocks.markAsReadMock).toHaveBeenCalledWith('n-1');
    expect(result.current.notifications[1]?.isRead).toBe(true);

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(notificationMocks.markAsReadMock).toHaveBeenCalledTimes(2);
    expect(notificationMocks.markAsReadMock).toHaveBeenLastCalledWith('n-2');
    expect(result.current.notifications.every((n) => n.isRead)).toBe(true);
    expect(result.current.unreadCount).toBe(0);

    act(() => {
      result.current.clearAll();
      result.current.clearError();
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('surfaces authentication issues and mark failures', async () => {
    notificationMocks.getCurrentUserMock.mockResolvedValue(null);
    notificationMocks.getTokenMock.mockReturnValue(null);

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe('User not authenticated');

    notificationMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    notificationMocks.getTokenMock.mockReturnValue('token-123');
    notificationMocks.connectMock.mockResolvedValue();

    await act(async () => {
      await result.current.connect();
    });

    notificationMocks.markAsReadMock.mockRejectedValueOnce(new Error('mark failed'));

    await act(async () => {
      await expect(result.current.markAsRead('n-3')).rejects.toThrow('mark failed');
    });
    expect(result.current.error).toBe('mark failed');
  });

  it('emits fallback errors when services reject with primitives', async () => {
    notificationMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    notificationMocks.getTokenMock.mockReturnValue('token-123');
    notificationMocks.connectMock.mockRejectedValueOnce('no auth');

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.connect();
    });
    expect(result.current.error).toBe('Failed to connect to notifications');

    notificationMocks.connectMock.mockResolvedValue();
    notificationMocks.disconnectMock.mockRejectedValueOnce('bye');
    notificationMocks.markAsReadMock.mockRejectedValueOnce('nope');

    await act(async () => {
      await result.current.connect();
    });

    act(() => {
      notificationMocks.listeners
        .get('notificationReceived')?.({ ...baseNotification, id: 'n-5' });
      notificationMocks.listeners
        .get('notificationReceived')?.({ ...baseNotification, id: 'n-6' });
    });

    await act(async () => {
      await expect(result.current.markAsRead('n-5')).rejects.toBe('nope');
    });
    expect(result.current.error).toBe('Failed to mark as read');

    notificationMocks.markAsReadMock.mockRejectedValueOnce('nah');
    await act(async () => {
      await expect(result.current.markAllAsRead()).rejects.toBe('nah');
    });
    expect(result.current.error).toBe('Failed to mark all as read');

    await act(async () => {
      await result.current.disconnect();
    });
    expect(result.current.error).toBe('Failed to disconnect from notifications');
  });
});
