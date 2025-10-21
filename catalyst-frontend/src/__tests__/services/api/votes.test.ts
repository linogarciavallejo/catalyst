import { describe, it, expect, beforeEach, vi } from 'vitest';
import { votesService } from '@/services/api/votes';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/services/api/client', () => ({
  apiClient: apiClientMock,
  default: apiClientMock,
}));

describe('votesService API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClientMock.get.mockReset();
    apiClientMock.post.mockReset();
    apiClientMock.delete.mockReset();
  });

  it('fetches votes and gracefully handles missing user vote', async () => {
    const votes = [{ id: 'v-1' }];
    apiClientMock.get.mockResolvedValueOnce(votes);

    await expect(votesService.getVotes('idea-1')).resolves.toBe(votes);
    expect(apiClientMock.get).toHaveBeenCalledWith('/votes?ideaId=idea-1');

    apiClientMock.get
      .mockResolvedValueOnce({ id: 'vote-user' })
      .mockRejectedValueOnce(new Error('missing'));

    await expect(votesService.getUserVote('idea-1')).resolves.toEqual({ id: 'vote-user' });
    expect(apiClientMock.get).toHaveBeenCalledWith('/votes/idea-1/user');

    await expect(votesService.getUserVote('idea-1')).resolves.toBeNull();
  });

  it('submits and removes votes', async () => {
    const vote = { id: 'new-vote' } as any;
    apiClientMock.post.mockResolvedValueOnce(vote);
    apiClientMock.delete
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    await expect(votesService.submitVote({ ideaId: 'idea-1', voteType: 'Upvote' } as any)).resolves.toBe(vote);
    expect(apiClientMock.post).toHaveBeenCalledWith('/votes', expect.objectContaining({ ideaId: 'idea-1' }));

    await expect(votesService.removeVote('vote-1')).resolves.toBeUndefined();
    expect(apiClientMock.delete).toHaveBeenCalledWith('/votes/vote-1');

    await expect(votesService.removeVoteByIdea('idea-1')).resolves.toBeUndefined();
    expect(apiClientMock.delete).toHaveBeenCalledWith('/votes/idea/idea-1');
  });
});
