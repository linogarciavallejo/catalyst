import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthService from '@/services/authService';

const apiMocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  setAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
  getAuthToken: vi.fn(),
  handle: vi.fn((error: unknown) => ({ status: 500, message: String(error) })),
}));

vi.mock('@/services/api', () => ({
  ApiClient: {
    getInstance: () => ({ post: apiMocks.post, get: apiMocks.get }),
    setAuthToken: apiMocks.setAuthToken,
    clearAuthToken: apiMocks.clearAuthToken,
    getAuthToken: apiMocks.getAuthToken,
  },
  ApiErrorHandler: {
    handle: apiMocks.handle,
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.post.mockReset();
    apiMocks.get.mockReset();
    apiMocks.setAuthToken.mockReset();
    apiMocks.clearAuthToken.mockReset();
    apiMocks.getAuthToken.mockReset();
    apiMocks.handle.mockReset();
    apiMocks.handle.mockImplementation((error: unknown) => ({ status: 500, message: String(error) }));
  });

  it('logs in users, transforms responses, and stores tokens', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { accessToken: 'token-1', oid: 'user-1' } });

    const result = await AuthService.login({ email: 'jane@example.com', password: 'secret' });

    expect(apiMocks.post).toHaveBeenCalledWith('/auth/login', {
      email: 'jane@example.com',
      password: 'secret',
    });
    expect(apiMocks.setAuthToken).toHaveBeenCalledWith('token-1');
    expect(result).toMatchObject({
      token: 'token-1',
      user: {
        id: 'user-1',
        email: 'jane@example.com',
        displayName: 'jane',
        role: 'Contributor',
      },
    });
    expect(result.user.createdAt).toBeInstanceOf(Date);
  });

  it('surfaces handled errors when login fails', async () => {
    const handled = { status: 401, message: 'Invalid' };
    apiMocks.handle.mockReturnValueOnce(handled);
    apiMocks.post.mockRejectedValueOnce(new Error('boom'));

    await expect(AuthService.login({ email: 'bad@example.com', password: 'nope' })).rejects.toBe(handled);
    expect(apiMocks.handle).toHaveBeenCalledWith(expect.any(Error));
  });

  it('skips token persistence when the backend omits access tokens', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { accessToken: '', oid: undefined } });

    const result = await AuthService.login({ email: 'missing@example.com', password: 'secret' });

    expect(apiMocks.setAuthToken).not.toHaveBeenCalled();
    expect(result.token).toBe('');
    expect(result.user.id).toBe('');
  });

  it('fills a fallback identifier when the backend omits oid values', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { accessToken: 'token-3', oid: undefined } });

    const result = await AuthService.login({ email: 'anon@example.com', password: 'secret' });

    expect(apiMocks.setAuthToken).toHaveBeenCalledWith('token-3');
    expect(result.user.id).toBe('');
  });

  it('registers users and uses display name from payload', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { accessToken: 'token-2', oid: 'user-2' } });

    const result = await AuthService.register({
      email: 'alex@example.com',
      displayName: 'Alex',
      password: 'pass',
    });

    expect(apiMocks.post).toHaveBeenCalledWith('/auth/register', {
      email: 'alex@example.com',
      displayName: 'Alex',
      password: 'pass',
    });
    expect(apiMocks.setAuthToken).toHaveBeenCalledWith('token-2');
    expect(result.user).toMatchObject({
      id: 'user-2',
      displayName: 'Alex',
    });
  });

  it('propagates handled error on register failure', async () => {
    const handled = { status: 500, message: 'fail' };
    apiMocks.handle.mockReturnValueOnce(handled);
    apiMocks.post.mockRejectedValueOnce('oops');

    await expect(AuthService.register({ email: 'x', displayName: 'X', password: 'y' })).rejects.toBe(handled);
    expect(apiMocks.handle).toHaveBeenCalledWith('oops');
  });

  it('propagates handled errors when register payload is missing', async () => {
    const handled = { status: 500, message: 'missing payload' };
    apiMocks.handle.mockReturnValueOnce(handled);
    apiMocks.post.mockResolvedValueOnce({ data: undefined });

    await expect(
      AuthService.register({ email: 'ghost@example.com', displayName: 'Ghost', password: 'boo' }),
    ).rejects.toBe(handled);

    expect(apiMocks.handle).toHaveBeenCalledWith(expect.any(TypeError));
  });

  it('logs out even when server returns an error', async () => {
    apiMocks.post.mockResolvedValueOnce(undefined);
    await expect(AuthService.logout()).resolves.toBeUndefined();
    expect(apiMocks.post).toHaveBeenCalledWith('/auth/logout');
    expect(apiMocks.clearAuthToken).toHaveBeenCalledTimes(1);

    const handled = { status: 500, message: 'failed' };
    apiMocks.handle.mockReturnValueOnce(handled);
    apiMocks.post.mockRejectedValueOnce('nope');

    await expect(AuthService.logout()).rejects.toBe(handled);
    expect(apiMocks.clearAuthToken).toHaveBeenCalledTimes(2);
    expect(apiMocks.handle).toHaveBeenCalledWith('nope');
  });

  it('retrieves the current user and normalises errors', async () => {
    const user = { id: '1', email: 'a', displayName: 'A', role: 'Contributor', eipPoints: 0, createdAt: new Date() } as const;
    apiMocks.get.mockResolvedValueOnce({ data: user });

    await expect(AuthService.getCurrentUser()).resolves.toBe(user);
    expect(apiMocks.get).toHaveBeenCalledWith('/auth/me');

    const handled = { status: 500, message: 'fail' };
    apiMocks.handle.mockReturnValueOnce(handled);
    apiMocks.get.mockRejectedValueOnce('boom');
    await expect(AuthService.getCurrentUser()).rejects.toBe(handled);
  });

  it('refreshes tokens and surfaces failures', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { token: 'new-token' } });
    await expect(AuthService.refreshToken()).resolves.toBe('new-token');
    expect(apiMocks.post).toHaveBeenCalledWith('/auth/refresh');
    expect(apiMocks.setAuthToken).toHaveBeenCalledWith('new-token');

    const handled = { status: 500, message: 'nope' };
    apiMocks.handle.mockReturnValueOnce(handled);
    apiMocks.post.mockRejectedValueOnce('err');
    await expect(AuthService.refreshToken()).rejects.toBe(handled);
  });

  it('reads authentication state helpers', () => {
    apiMocks.getAuthToken.mockReturnValueOnce('token');
    expect(AuthService.isAuthenticated()).toBe(true);

    apiMocks.getAuthToken.mockReturnValueOnce(null);
    expect(AuthService.isAuthenticated()).toBe(false);

    apiMocks.getAuthToken.mockReturnValue('stored');
    expect(AuthService.getToken()).toBe('stored');
  });
});
