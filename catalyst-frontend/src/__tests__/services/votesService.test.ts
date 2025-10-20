import { describe, it, expect, beforeEach, vi } from 'vitest';
import VotesService from '@/services/votesService';

const apiMocks = vi.hoisted(() => ({
  client: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  handle: vi.fn(() => ({ status: 500, message: 'handled' })),
}));

vi.mock('@/services/api', () => ({
  ApiClient: {
    getInstance: () => apiMocks.client,
  },
  ApiErrorHandler: {
    handle: apiMocks.handle,
  },
}));

describe('VotesService', () => {
  const handledError = { status: 500, message: 'handled' };

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.client.get.mockReset();
    apiMocks.client.post.mockReset();
    apiMocks.client.delete.mockReset();
    apiMocks.handle.mockReset();
    apiMocks.handle.mockImplementation(() => handledError);
  });

  it('fetches votes and handles missing user vote gracefully', async () => {
    const vote = { id: '1', ideaId: 'idea-1' } as any;
    apiMocks.client.get
      .mockResolvedValueOnce({ data: [vote] })
      .mockResolvedValueOnce({ data: vote });

    await expect(VotesService.getVotesForIdea('idea-1')).resolves.toEqual([vote]);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/votes/idea/idea-1');

    await expect(VotesService.getUserVoteForIdea('idea-1')).resolves.toBe(vote);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/votes/idea/idea-1/user');

    apiMocks.handle.mockReturnValueOnce({ status: 404, message: 'not found' });
    apiMocks.client.get.mockRejectedValueOnce('missing');
    await expect(VotesService.getUserVoteForIdea('idea-1')).resolves.toBeNull();
  });

  it('submits and removes votes', async () => {
    const created = { id: 'vote-1' } as any;
    apiMocks.client.post.mockResolvedValueOnce({ data: created });
    apiMocks.client.delete.mockResolvedValueOnce(undefined);

    await expect(VotesService.vote('idea-1', 'Upvote')).resolves.toBe(created);
    expect(apiMocks.client.post).toHaveBeenCalledWith('/votes', { ideaId: 'idea-1', voteType: 'Upvote' });

    await expect(VotesService.removeVote('idea-1')).resolves.toBeUndefined();
    expect(apiMocks.client.delete).toHaveBeenCalledWith('/votes/idea/idea-1');
  });

  it('surfaces handled errors when API calls fail', async () => {
    apiMocks.client.get.mockRejectedValueOnce('boom');
    await expect(VotesService.getVotesForIdea('idea-1')).rejects.toBe(handledError);

    apiMocks.client.post.mockRejectedValueOnce('post-fail');
    await expect(VotesService.vote('idea-1', 'Downvote')).rejects.toBe(handledError);

    apiMocks.client.delete.mockRejectedValueOnce('delete-fail');
    await expect(VotesService.removeVote('idea-1')).rejects.toBe(handledError);
  });
});
