import { renderHook, act } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import type { ChatMessage } from '@/types';
import { useChat } from '@/hooks/useChat';

const chatMocks = vi.hoisted(() => {
  const listeners = new Map<string, (payload?: unknown) => void>();
  const connectMock = vi.fn<[
    string,
    string
  ], Promise<void>>();
  const disconnectMock = vi.fn<[], Promise<void>>();
  const sendMessageMock = vi.fn<[
    string,
    string
  ], Promise<void>>();
  const joinRoomMock = vi.fn<[
    string
  ], Promise<void>>();
  const leaveRoomMock = vi.fn<[
    string
  ], Promise<void>>();
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
    sendMessageMock,
    joinRoomMock,
    leaveRoomMock,
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
    ChatService: {
      connect: (...args: Parameters<typeof chatMocks.connectMock>) =>
        chatMocks.connectMock(...args),
      disconnect: (...args: Parameters<typeof chatMocks.disconnectMock>) =>
        chatMocks.disconnectMock(...args),
      sendMessage: (...args: Parameters<typeof chatMocks.sendMessageMock>) =>
        chatMocks.sendMessageMock(...args),
      joinRoom: (...args: Parameters<typeof chatMocks.joinRoomMock>) =>
        chatMocks.joinRoomMock(...args),
      leaveRoom: (...args: Parameters<typeof chatMocks.leaveRoomMock>) =>
        chatMocks.leaveRoomMock(...args),
      on: chatMocks.onMock,
      off: chatMocks.offMock,
    },
    AuthService: {
      getCurrentUser: () => chatMocks.getCurrentUserMock(),
      getToken: () => chatMocks.getTokenMock(),
    },
  };
});

describe('useChat', () => {
  beforeEach(() => {
    chatMocks.listeners.clear();
    vi.clearAllMocks();
  });

  it('connects, registers listeners, and receives messages', async () => {
    chatMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    chatMocks.getTokenMock.mockReturnValue('token-123');
    chatMocks.connectMock.mockResolvedValue();

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.connect();
    });

    expect(chatMocks.connectMock).toHaveBeenCalledWith('user-1', 'token-123');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(chatMocks.onMock).toHaveBeenCalledTimes(3);

    const message = { id: 'm1', content: 'hello' } as ChatMessage;
    act(() => {
      chatMocks.listeners.get('messageReceived')?.(message);
    });

    expect(result.current.messages).toEqual([message]);
  });

  it('cleans up listeners and state on disconnect', async () => {
    chatMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    chatMocks.getTokenMock.mockReturnValue('token-123');
    chatMocks.connectMock.mockResolvedValue();
    chatMocks.disconnectMock.mockResolvedValue();

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.connect();
    });

    const registeredMessageListener = chatMocks.listeners.get('messageReceived');

    await act(async () => {
      await result.current.disconnect();
    });

    expect(chatMocks.disconnectMock).toHaveBeenCalled();
    expect(chatMocks.offMock).toHaveBeenCalledWith('messageReceived', registeredMessageListener);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.activeUsers).toEqual([]);
    expect(result.current.typingUsers.size).toBe(0);
  });

  it('surfaces authentication and transport failures', async () => {
    chatMocks.getCurrentUserMock.mockResolvedValue(null);
    chatMocks.getTokenMock.mockReturnValue(null);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe('User not authenticated');
    expect(result.current.isConnected).toBe(false);

    chatMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    chatMocks.getTokenMock.mockReturnValue('token-123');
    chatMocks.connectMock.mockRejectedValue(new Error('connect failed'));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe('connect failed');
  });

  it('propagates message, room, and clear helpers', async () => {
    chatMocks.getCurrentUserMock.mockResolvedValue({ id: 'user-1' });
    chatMocks.getTokenMock.mockReturnValue('token-123');
    chatMocks.connectMock.mockResolvedValue();
    chatMocks.sendMessageMock.mockRejectedValueOnce(new Error('send failed'));
    chatMocks.joinRoomMock.mockRejectedValueOnce(new Error('join failed'));
    chatMocks.leaveRoomMock.mockRejectedValueOnce(new Error('leave failed'));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.connect();
    });

    await act(async () => {
      await expect(
        result.current.sendMessage('general', 'hello'),
      ).rejects.toThrow('send failed');
    });
    expect(result.current.error).toBe('send failed');

    await act(async () => {
      await expect(result.current.joinRoom('general')).rejects.toThrow(
        'join failed',
      );
    });
    expect(result.current.error).toBe('join failed');

    await act(async () => {
      await expect(result.current.leaveRoom('general')).rejects.toThrow(
        'leave failed',
      );
    });
    expect(result.current.error).toBe('leave failed');

    act(() => {
      chatMocks.listeners.get('messageReceived')?.({ id: 'm2' });
    });
    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.clearMessages();
      result.current.clearError();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
