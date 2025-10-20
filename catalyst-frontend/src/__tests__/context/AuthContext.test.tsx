import type { FC, ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { useAuthContext } from '@/hooks/useAuthContext';

describe('AuthProvider', () => {
  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('throws when used outside of the provider', () => {
    expect(() => renderHook(() => useAuthContext())).toThrow(
      'useAuthContext must be used within an AuthProvider'
    );
  });

  it('initialises from localStorage and updates auth state on logout', async () => {
    const storedUser = { id: '1', email: 'user@example.com', displayName: 'User' };
    localStorage.setItem('user', JSON.stringify(storedUser));
    localStorage.setItem('token', 'token-123');

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    expect(result.current.user).toMatchObject(storedUser);
    expect(result.current.token).toBe('token-123');
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('toggles loading flags for login and register and clears errors', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.login('user@example.com', 'secret');
      await result.current.register(
        'user@example.com',
        'Display',
        'secret',
        'secret'
      );
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
