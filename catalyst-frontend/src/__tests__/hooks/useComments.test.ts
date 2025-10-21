import { renderHook, act } from '@testing-library/react';
import { useComments } from '@/hooks/useComments';

const connect = vi.fn().mockResolvedValue(undefined);
const disconnect = vi.fn().mockResolvedValue(undefined);
let onAdded: ((comment: any) => void) | null = null;
let onUpdated: ((comment: any) => void) | null = null;
let onDeleted: ((id: string) => void) | null = null;

vi.mock('@/services/signalr/hubs/commentsHub', () => ({
  CommentsHub: vi.fn().mockImplementation(() => ({
    connect,
    disconnect,
    onCommentAdded: vi.fn((handler: (comment: any) => void) => {
      onAdded = handler;
    }),
    onCommentUpdated: vi.fn((handler: (comment: any) => void) => {
      onUpdated = handler;
    }),
    onCommentDeleted: vi.fn((handler: (id: string) => void) => {
      onDeleted = handler;
    }),
  })),
}));

const getComments = vi.fn();
const addComment = vi.fn();
const updateComment = vi.fn();
const deleteComment = vi.fn();
const getCommentCount = vi.fn();

vi.mock('@/services/api/comments', () => ({
  commentsService: {
    getComments: (...args: unknown[]) => getComments(...args),
    addComment: (...args: unknown[]) => addComment(...args),
    updateComment: (...args: unknown[]) => updateComment(...args),
    deleteComment: (...args: unknown[]) => deleteComment(...args),
    getCommentCount: (...args: unknown[]) => getCommentCount(...args),
  },
}));

const baseComment = {
  id: 'comment-1',
  ideaId: 'idea-1',
  authorId: 'user',
  author: {
    id: 'user',
    displayName: 'User',
    email: 'user@test.com',
    role: 'Creator',
    eipPoints: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  content: 'Great idea',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

describe('useComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAdded = null;
    onUpdated = null;
    onDeleted = null;
  });

  it('loads comments and handles optimistic creation', async () => {
    getComments.mockResolvedValue([baseComment]);
    addComment.mockResolvedValue({ ...baseComment, id: 'comment-2' });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    connect.mockRejectedValueOnce(new Error('connect failed'));

    const { result } = renderHook(() => useComments());

    await act(async () => {
      await result.current.getComments('idea-1');
    });

    expect(result.current.comments).toHaveLength(1);

    await act(async () => {
      await result.current.addComment({ ideaId: 'idea-1', content: 'New comment' });
    });

    expect(result.current.pendingComments).toHaveLength(0);
    expect(result.current.comments.some((c) => c.id === 'comment-2')).toBe(true);
    expect(
      consoleSpy.mock.calls.some(
        ([message]) => message === 'Failed to connect to CommentsHub:'
      )
    ).toBe(true);

    act(() => {
      onAdded?.(baseComment);
      onAdded?.(baseComment);
    });

    expect(result.current.comments.filter((c) => c.id === baseComment.id)).toHaveLength(1);

    consoleSpy.mockRestore();
  });

  it('rolls back optimistic failures and exposes error state', async () => {
    addComment.mockRejectedValue(new Error('Failed to add comment'));

    const { result } = renderHook(() => useComments());

    await act(async () => {
      await expect(
        result.current.addComment({ ideaId: 'idea-1', content: 'Test' })
      ).rejects.toThrow('Failed to add comment');
    });

    expect(result.current.pendingComments).toHaveLength(0);
    expect(result.current.error).toBe('Failed to add comment');
  });

  it('updates, deletes, counts, and reacts to hub events', async () => {
    updateComment.mockResolvedValue({ ...baseComment, content: 'Updated' });
    deleteComment.mockResolvedValue(undefined);
    getCommentCount.mockResolvedValue(5);

    const { result } = renderHook(() => useComments());

    await act(async () => {
      await result.current.updateComment('comment-1', 'Updated');
    });

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.deleteComment('comment-1');
    });

    await act(async () => {
      const count = await result.current.getCommentCount('idea-1');
      expect(count).toBe(5);
    });

    act(() => {
      onAdded?.({ ...baseComment, id: 'comment-3' });
      onUpdated?.({ ...baseComment, id: 'comment-3', content: 'Realtime' });
      onDeleted?.('comment-3');
    });

    expect(result.current.comments.find((c) => c.id === 'comment-3')).toBeUndefined();
  });

  it('reports service failures and allows clearing error state', async () => {
    getComments.mockRejectedValueOnce(new Error('load failed'));
    updateComment.mockRejectedValueOnce(new Error('update failed'));
    deleteComment.mockRejectedValueOnce(new Error('delete failed'));
    getCommentCount.mockRejectedValueOnce(new Error('count failed'));
    disconnect.mockRejectedValueOnce(new Error('disconnect failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useComments());

    await act(async () => {
      await result.current.getComments('idea-1');
    });
    expect(result.current.error).toBe('load failed');

    await act(async () => {
      await expect(result.current.updateComment('comment-1', 'Updated')).rejects.toThrow('update failed');
    });
    expect(result.current.error).toBe('update failed');

    await act(async () => {
      await expect(result.current.deleteComment('comment-1')).rejects.toThrow('delete failed');
    });
    expect(result.current.error).toBe('delete failed');

    await act(async () => {
      await expect(result.current.getCommentCount('idea-1')).rejects.toThrow('count failed');
    });
    expect(result.current.error).toBe('count failed');

    expect(result.current.isPending('missing')).toBe(false);

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();

    await act(async () => {
      unmount();
      await Promise.resolve();
    });

    expect(
      consoleSpy.mock.calls.some(
        ([message]) => message === 'Failed to disconnect from CommentsHub:'
      )
    ).toBe(true);

    consoleSpy.mockRestore();
  });
});
