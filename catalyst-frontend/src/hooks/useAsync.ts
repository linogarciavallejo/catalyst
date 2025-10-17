import { useState, useEffect, useCallback } from "react";

export interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  refetch: () => Promise<void>;
}

/**
 * Hook for managing async operations with automatic or manual execution
 * @param asyncFunction - The async function to execute
 * @param immediate - Whether to execute immediately (default: true)
 * @returns Object with data, isLoading, error, and refetch function
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use useCallback so the executing function has a stable reference
  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  // Call execute if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    isLoading,
    error,
    refetch: execute,
  };
}
