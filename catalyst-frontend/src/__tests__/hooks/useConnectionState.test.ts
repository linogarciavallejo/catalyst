import { describe, it, expect, beforeEach, afterEach, vi, afterAll, beforeAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConnectionState } from '@/hooks/useConnectionState';

type Handler = EventListenerOrEventListenerObject;

const handlers: Record<string, Handler[]> = {
  online: [],
  offline: [],
};

let addSpy: ReturnType<typeof vi.spyOn>;
let removeSpy: ReturnType<typeof vi.spyOn>;
let onlineFlag = true;
const originalDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'onLine');

beforeAll(() => {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => onlineFlag,
  });
});

afterAll(() => {
  if (originalDescriptor) {
    Object.defineProperty(window.navigator, 'onLine', originalDescriptor);
  }
});

beforeEach(() => {
  onlineFlag = true;
  handlers.online = [];
  handlers.offline = [];
  vi.useFakeTimers();
  addSpy = vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
    if (event === 'online' || event === 'offline') {
      handlers[event].push(handler as Handler);
    }
  });
  removeSpy = vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
    if (event === 'online' || event === 'offline') {
      handlers[event] = handlers[event].filter((h) => h !== handler);
    }
  });
});

afterEach(() => {
  vi.useRealTimers();
  addSpy.mockRestore();
  removeSpy.mockRestore();
});

const trigger = (event: 'online' | 'offline') => {
  handlers[event].forEach((handler) => {
    if (typeof handler === 'function') {
      handler(new Event(event));
    } else if (handler && typeof (handler as EventListenerObject).handleEvent === 'function') {
      (handler as EventListenerObject).handleEvent(new Event(event));
    }
  });
};

describe('useConnectionState', () => {
  it('reacts to browser online/offline events', () => {
    const { result } = renderHook(() => useConnectionState());

    expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    act(() => {
      onlineFlag = false;
      trigger('offline');
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionType).toBe('offline');
    expect(result.current.error).toBe('No internet connection');

    act(() => {
      onlineFlag = true;
      trigger('online');
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionType).toBe('rest');
    expect(result.current.error).toBeNull();
  });

  it('handles reconnect attempts for offline and online scenarios', async () => {
    const { result } = renderHook(() => useConnectionState());

    await act(async () => {
      onlineFlag = false;
      await result.current.reconnect();
    });

    expect(result.current.error).toBe('No internet connection');
    expect(result.current.isConnected).toBe(true);

    act(() => {
      onlineFlag = false;
      trigger('offline');
    });

    expect(result.current.isConnected).toBe(false);

    await act(async () => {
      onlineFlag = true;
      const reconnectPromise = result.current.reconnect();
      await vi.advanceTimersByTimeAsync(500);
      await reconnectPromise;
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionType).toBe('websocket');
    expect(result.current.reconnectAttempts).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('disconnects, clears errors, and removes listeners on unmount', async () => {
    const { result, unmount } = renderHook(() => useConnectionState());

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe('Disconnected');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
