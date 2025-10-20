import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';

describe('useAsync', () => {
  it('executes immediately by default and stores the result', async () => {
    const fetcher = vi.fn().mockResolvedValue('payload');

    const { result } = renderHook(() => useAsync(fetcher));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe('payload');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('supports manual execution and error handling', async () => {
    const error = new Error('failure');
    const fetcher = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useAsync(fetcher, false));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });
});
