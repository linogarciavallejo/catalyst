import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActivity } from '@/hooks/useActivity';

type Listener = (...args: any[]) => void;

const listenerRegistry: {
  typing?: Listener;
  stoppedTyping?: Listener;
  viewing?: Listener;
  idle?: Listener;
  active?: Listener;
} = {};

const instances: Array<ReturnType<typeof createInstance>> = [];

function createInstance() {
  return {
    onUserTyping: vi.fn((cb: Listener) => {
      listenerRegistry.typing = cb;
    }),
    onUserStoppedTyping: vi.fn((cb: Listener) => {
      listenerRegistry.stoppedTyping = cb;
    }),
    onUserViewing: vi.fn((cb: Listener) => {
      listenerRegistry.viewing = cb;
    }),
    onUserIdle: vi.fn((cb: Listener) => {
      listenerRegistry.idle = cb;
    }),
    onActiveUsersUpdated: vi.fn((cb: Listener) => {
      listenerRegistry.active = cb;
    }),
    sendTypingActivity: vi.fn().mockResolvedValue(undefined),
    sendViewingActivity: vi.fn().mockResolvedValue(undefined),
    sendIdleActivity: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
}

vi.mock('@/services/signalr/hubs/activityHub', () => ({
  ActivityHub: vi.fn(() => {
    const instance = createInstance();
    instances.push(instance);
    return instance;
  }),
}));

describe('useActivity', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    instances.length = 0;
    Object.keys(listenerRegistry).forEach((key) => delete listenerRegistry[key as keyof typeof listenerRegistry]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks typing state with automatic timeout cleanup', () => {
    const { result } = renderHook(() => useActivity());

    expect(listenerRegistry.typing).toBeDefined();

    act(() => {
      listenerRegistry.typing?.('user-1', 'Ada', 'idea-1');
    });

    expect(result.current.typingUsers['idea-1']).toEqual(['Ada']);

    act(() => {
      listenerRegistry.typing?.('user-1', 'Ada', 'idea-1');
    });

    expect(result.current.typingUsers['idea-1']).toEqual(['Ada']);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.typingUsers['idea-1']).toEqual([]);
  });

  it('updates viewing and active users and removes idle participants', () => {
    const { result } = renderHook(() => useActivity());

    act(() => {
      listenerRegistry.viewing?.('user-2', 'Grace', 'idea-2');
      listenerRegistry.active?.([
        { userId: 'user-2', userName: 'Grace', ideaId: 'idea-2', status: 'viewing' },
      ]);
    });

    expect(result.current.viewingUsers['idea-2']).toEqual(['Grace']);
    expect(result.current.activeUsers).toEqual([
      { userId: 'user-2', userName: 'Grace', ideaId: 'idea-2', status: 'viewing' },
    ]);

    act(() => {
      listenerRegistry.idle?.('Grace');
    });

    expect(result.current.viewingUsers['idea-2']).toEqual([]);
  });

  it('sends activity updates through the hub helpers', async () => {
    const { result } = renderHook(() => useActivity());

    await act(async () => {
      await result.current.startTyping('idea-3');
      await result.current.stopTyping('idea-3');
      await result.current.setViewingIdea('idea-3');
      await result.current.setIdle();
    });

    const typingCalls = instances.flatMap((inst) => inst.sendTypingActivity.mock.calls);
    const viewingCalls = instances.flatMap((inst) => inst.sendViewingActivity.mock.calls);
    const idleCalls = instances.flatMap((inst) => inst.sendIdleActivity.mock.calls);

    expect(typingCalls).toContainEqual(['idea-3', true]);
    expect(typingCalls).toContainEqual(['idea-3', false]);
    expect(viewingCalls).toContainEqual(['idea-3']);
    expect(idleCalls).toHaveLength(1);
  });

  it('disconnects the final hub instance on unmount', () => {
    const { unmount } = renderHook(() => useActivity());

    expect(instances).not.toHaveLength(0);

    unmount();

    const finalInstance = instances.at(-1)!;
    expect(finalInstance.disconnect).toHaveBeenCalled();
  });
});
