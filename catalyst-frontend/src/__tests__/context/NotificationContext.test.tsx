import type { FC, ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { NotificationContextProvider } from '@/context/NotificationContext';
import { useNotificationContext } from '@/hooks/useNotificationContext';

describe('NotificationContextProvider', () => {
  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <NotificationContextProvider>{children}</NotificationContextProvider>
  );

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('throws when the hook is used without a provider', () => {
    expect(() => renderHook(() => useNotificationContext())).toThrow(
      'useNotificationContext must be used within NotificationContextProvider'
    );
  });

  it('adds, removes, and clears notifications', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ id: '1', message: 'Created' } as any);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification('1');
      result.current.addNotification({ id: '2', message: 'Another' } as any);
      result.current.clearAllNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('manages toast lifecycle with auto removal', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.showToast('Saved successfully', 'success', 1000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.removeToast(result.current.toasts[0]!.id);
    });

    expect(result.current.toasts).toHaveLength(0);

    act(() => {
      result.current.showToast('Auto dismiss', 'info', 1000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});
