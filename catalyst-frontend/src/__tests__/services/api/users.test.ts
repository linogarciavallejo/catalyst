import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usersService } from '@/services/api/users';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('@/services/api/client', () => ({
  apiClient: apiClientMock,
  default: apiClientMock,
}));

describe('usersService API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClientMock.get.mockReset();
  });

  it('retrieves user data and stats', async () => {
    const user = { id: 'user-1' } as any;
    apiClientMock.get
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce({ items: [user], total: 1, page: 2, pageSize: 10, totalPages: 3 })
      .mockResolvedValueOnce({ ideasCreated: 1, votesGiven: 2, commentsGiven: 3, eipPoints: 10 })
      .mockResolvedValueOnce([user]);

    await expect(usersService.getUserById('user-1')).resolves.toBe(user);
    expect(apiClientMock.get).toHaveBeenCalledWith('/users/user-1');

    await expect(usersService.getUserByEmail('test@example.com')).resolves.toBe(user);
    expect(apiClientMock.get).toHaveBeenCalledWith('/users/email/test%40example.com');

    await expect(usersService.getAllUsers(2, 10)).resolves.toEqual({ items: [user], total: 1, page: 2, pageSize: 10, totalPages: 3 });
    expect(apiClientMock.get).toHaveBeenCalledWith('/users?page=2&pageSize=10');

    await expect(usersService.getUserStats('user-1')).resolves.toEqual({ ideasCreated: 1, votesGiven: 2, commentsGiven: 3, eipPoints: 10 });
    expect(apiClientMock.get).toHaveBeenCalledWith('/users/user-1/stats');

    await expect(usersService.getLeaderboard(5)).resolves.toEqual([user]);
    expect(apiClientMock.get).toHaveBeenCalledWith('/users/leaderboard?limit=5');
  });
});
