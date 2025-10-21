import { describe, it, expect, beforeEach, vi } from 'vitest';
import { commentsService } from '@/services/api/comments';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/services/api/client', () => ({
  apiClient: apiClientMock,
  default: apiClientMock,
}));

describe('commentsService API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClientMock.get.mockReset();
    apiClientMock.post.mockReset();
    apiClientMock.put.mockReset();
    apiClientMock.delete.mockReset();
  });

  it('fetches idea comments and individual comment details', async () => {
    const comment = { id: '1' } as any;
    apiClientMock.get
      .mockResolvedValueOnce([comment])
      .mockResolvedValueOnce(comment)
      .mockResolvedValueOnce({ count: 4 });

    await expect(commentsService.getComments('idea-1')).resolves.toEqual([comment]);
    expect(apiClientMock.get).toHaveBeenCalledWith('/ideas/idea-1/comments');

    await expect(commentsService.getCommentById('comment-1')).resolves.toBe(comment);
    expect(apiClientMock.get).toHaveBeenCalledWith('/comments/comment-1');

    await expect(commentsService.getCommentCount('idea-1')).resolves.toBe(4);
    expect(apiClientMock.get).toHaveBeenCalledWith('/ideas/idea-1/comments/count');
  });

  it('creates, updates, and deletes comments', async () => {
    const comment = { id: '1', content: 'Great!' } as any;
    apiClientMock.post.mockResolvedValueOnce(comment);
    apiClientMock.put.mockResolvedValueOnce(comment);
    apiClientMock.delete.mockResolvedValueOnce(undefined);

    await expect(commentsService.addComment({ ideaId: 'idea-1', content: 'Great!' } as any)).resolves.toBe(comment);
    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/ideas/idea-1/comments',
      expect.objectContaining({ content: 'Great!' })
    );

    await expect(commentsService.updateComment('comment-1', 'Updated')).resolves.toBe(comment);
    expect(apiClientMock.put).toHaveBeenCalledWith('/comments/comment-1', { content: 'Updated' });

    await expect(commentsService.deleteComment('comment-1')).resolves.toBeUndefined();
    expect(apiClientMock.delete).toHaveBeenCalledWith('/comments/comment-1');
  });
});
