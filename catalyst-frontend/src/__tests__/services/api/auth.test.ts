import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '@/services/api/auth';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('@/services/api/client', () => ({
  apiClient: apiClientMock,
  default: apiClientMock,
}));

describe('authService API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClientMock.get.mockReset();
    apiClientMock.post.mockReset();
    apiClientMock.put.mockReset();
    localStorage.clear();
  });

  it('logs in, registers, and refreshes tokens via the API client', async () => {
    const loginResponse = { token: 'abc' };
    apiClientMock.post.mockResolvedValueOnce(loginResponse);

    await expect(authService.login({ email: 'a', password: 'b' } as any)).resolves.toBe(loginResponse);
    expect(apiClientMock.post).toHaveBeenCalledWith('/auth/login', expect.objectContaining({ email: 'a' }));

    const registerResponse = { id: 'user-1' } as any;
    apiClientMock.post.mockResolvedValueOnce(registerResponse);
    await expect(authService.register({ email: 'a', password: 'b', displayName: 'A' } as any)).resolves.toBe(registerResponse);
    expect(apiClientMock.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ displayName: 'A' }));

    const refreshResponse = { token: 'new' } as any;
    apiClientMock.post.mockResolvedValueOnce(refreshResponse);
    await expect(authService.refreshToken()).resolves.toBe(refreshResponse);
    expect(apiClientMock.post).toHaveBeenCalledWith('/auth/refresh', expect.any(Object));
  });

  it('retrieves and updates the user profile', async () => {
    const profile = { id: 'user-1' } as any;
    apiClientMock.get.mockResolvedValueOnce(profile);

    await expect(authService.getProfile()).resolves.toBe(profile);
    expect(apiClientMock.get).toHaveBeenCalledWith('/auth/profile');

    const updated = { id: 'user-1', displayName: 'Updated' } as any;
    apiClientMock.put.mockResolvedValueOnce(updated);

    await expect(authService.updateProfile({ displayName: 'Updated' } as any)).resolves.toBe(updated);
    expect(apiClientMock.put).toHaveBeenCalledWith('/auth/profile', expect.objectContaining({ displayName: 'Updated' }));
  });

  it('logs out and clears persisted auth entries', async () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', 'user-data');
    apiClientMock.post.mockResolvedValueOnce(undefined);

    await expect(authService.logout()).resolves.toBeUndefined();
    expect(apiClientMock.post).toHaveBeenCalledWith('/auth/logout', expect.any(Object));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
