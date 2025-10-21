import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/services', () => ({
  AuthService: {
    login: (...args: unknown[]) => mockLogin(...args),
    register: (...args: unknown[]) => mockRegister(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
  },
}));

describe('useAuth', () => {
  const user = {
    id: '1',
    email: 'user@test.com',
    displayName: 'User',
    role: 'Contributor',
    eipPoints: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('logs in and stores auth details', async () => {
    mockLogin.mockResolvedValue({ token: 'token', user });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'user@test.com', password: 'secret' });
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe('token');
    expect(localStorage.getItem('user')).toContain('user@test.com');
    expect(localStorage.getItem('token')).toBe('token');
  });

  it('handles login failures', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(
        result.current.login({ email: 'user@test.com', password: 'bad' })
      ).rejects.toThrow('Invalid credentials');
    });

    expect(result.current.error).toBe('Invalid credentials');
  });

  it('registers and logs out users', async () => {
    mockRegister.mockResolvedValue({ token: 'token', user });
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register({
        email: 'user@test.com',
        displayName: 'User',
        password: 'secret',
      });
    });

    expect(result.current.user).toEqual(user);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('uses fallback auth error messages when services reject with primitives', async () => {
    mockLogin.mockRejectedValue('nope');
    mockRegister.mockRejectedValue('bad');

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(
        result.current.login({ email: 'user@test.com', password: 'secret' })
      ).rejects.toBe('nope');
    });
    expect(result.current.error).toBe('Login failed');

    await act(async () => {
      await expect(
        result.current.register({
          email: 'user@test.com',
          displayName: 'User',
          password: 'secret',
        })
      ).rejects.toBe('bad');
    });
    expect(result.current.error).toBe('Registration failed');
  });
});
