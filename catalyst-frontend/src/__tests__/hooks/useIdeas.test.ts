import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useIdeas } from '@/hooks/useIdeas';
import type { Idea } from '@/types';

const baseIdea: Idea = {
  id: 'idea-1',
  title: 'First idea',
  description: 'Description',
  category: 'Innovation',
  status: 'Submitted',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  authorId: 'user',
  author: {
    id: 'user',
    displayName: 'User',
    email: 'user@test.com',
    role: 'Contributor',
    eipPoints: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  upvotes: 0,
  downvotes: 0,
  commentCount: 0,
};

const connectMock = vi.fn();
const disconnectMock = vi.fn();
let ideaCreatedHandler: ((idea: Idea) => void) | null = null;
let voteUpdatedHandler:
  | ((ideaId: string, upvotes: number, downvotes: number) => void)
  | null = null;
let commentCountHandler: ((ideaId: string, commentCount: number) => void) | null = null;
let statusUpdatedHandler: ((ideaId: string, status: string) => void) | null = null;

const onIdeaCreatedMock = vi.fn((handler: (idea: Idea) => void) => {
  ideaCreatedHandler = handler;
});
const onVoteUpdatedMock = vi.fn(
  (handler: (ideaId: string, upvotes: number, downvotes: number) => void) => {
    voteUpdatedHandler = handler;
  },
);
const onCommentCountUpdatedMock = vi.fn(
  (handler: (ideaId: string, commentCount: number) => void) => {
    commentCountHandler = handler;
  },
);
const onStatusUpdatedMock = vi.fn(
  (handler: (ideaId: string, status: string) => void) => {
    statusUpdatedHandler = handler;
  },
);

vi.mock('@/services/signalr/hubs/ideasHub', () => ({
  IdeasHub: vi.fn().mockImplementation(() => ({
    connect: connectMock,
    disconnect: disconnectMock,
    onIdeaCreated: onIdeaCreatedMock,
    onVoteUpdated: onVoteUpdatedMock,
    onCommentCountUpdated: onCommentCountUpdatedMock,
    onIdeaStatusUpdated: onStatusUpdatedMock,
  })),
}));

const getAllIdeasMock = vi.fn();
const getIdeaByIdMock = vi.fn();
const createIdeaMock = vi.fn();
const updateIdeaMock = vi.fn();
const deleteIdeaMock = vi.fn();
const getTopIdeasMock = vi.fn();
const searchIdeasMock = vi.fn();

vi.mock('@/services', () => ({
  IdeasService: {
    getAllIdeas: (...args: unknown[]) => getAllIdeasMock(...args),
    getIdeaById: (...args: unknown[]) => getIdeaByIdMock(...args),
    createIdea: (...args: unknown[]) => createIdeaMock(...args),
    updateIdea: (...args: unknown[]) => updateIdeaMock(...args),
    deleteIdea: (...args: unknown[]) => deleteIdeaMock(...args),
    getTopIdeas: (...args: unknown[]) => getTopIdeasMock(...args),
    searchIdeas: (...args: unknown[]) => searchIdeasMock(...args),
  },
}));

describe('useIdeas', () => {
  beforeEach(() => {
    connectMock.mockReset();
    connectMock.mockResolvedValue(undefined);
    disconnectMock.mockReset();
    disconnectMock.mockResolvedValue(undefined);
    onIdeaCreatedMock.mockClear();
    onVoteUpdatedMock.mockClear();
    onCommentCountUpdatedMock.mockClear();
    onStatusUpdatedMock.mockClear();
    ideaCreatedHandler = null;
    voteUpdatedHandler = null;
    commentCountHandler = null;
    statusUpdatedHandler = null;

    getAllIdeasMock.mockReset();
    getIdeaByIdMock.mockReset();
    createIdeaMock.mockReset();
    updateIdeaMock.mockReset();
    deleteIdeaMock.mockReset();
    getTopIdeasMock.mockReset();
    searchIdeasMock.mockReset();
  });

  it('loads ideas, handles optimistic creation, and reacts to hub events', async () => {
    getAllIdeasMock.mockResolvedValue([baseIdea]);
    const createdIdea: Idea = { ...baseIdea, id: 'idea-2', title: 'Created idea' };
    let resolveCreate: ((idea: Idea) => void) | null = null;
    createIdeaMock.mockImplementation(
      () =>
        new Promise<Idea>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    updateIdeaMock.mockResolvedValue({ ...baseIdea, title: 'Updated title' });

    const { result, unmount } = renderHook(() => useIdeas());

    await act(async () => {
      await result.current.getIdeas();
    });

    expect(result.current.ideas).toEqual([baseIdea]);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMore).toBe(false);

    const listener = vi.fn();
    act(() => {
      result.current.onIdeaCreated(listener);
    });

    let createPromise!: Promise<Idea>;
    await act(async () => {
      createPromise = result.current.createIdea({
        title: 'Created idea',
        description: 'New description',
        category: 'Innovation',
      });
    });

    await waitFor(() => expect(result.current.pendingIdeas).toHaveLength(1));
    const pendingId = result.current.pendingIdeas[0]?.id;
    expect(pendingId).toMatch(/^pending-/);
    expect(result.current.isPending(pendingId!)).toBe(true);

    resolveCreate?.(createdIdea);
    await act(async () => {
      await createPromise;
    });

    expect(result.current.pendingIdeas).toHaveLength(0);
    expect(result.current.isPending(createdIdea.id)).toBe(false);
    expect(result.current.ideas[0]).toEqual(createdIdea);
    expect(listener).toHaveBeenCalledWith(createdIdea);

    await act(async () => {
      await result.current.updateIdea(baseIdea.id, { title: 'Updated title' });
    });
    expect(result.current.ideas[1]?.title).toBe('Updated title');

    act(() => {
      ideaCreatedHandler?.({ ...baseIdea, id: 'idea-remote', title: 'Remote' });
    });
    expect(result.current.ideas.map((idea) => idea.id)).toContain('idea-remote');

    act(() => {
      ideaCreatedHandler?.(createdIdea);
    });
    expect(result.current.ideas.filter((idea) => idea.id === createdIdea.id)).toHaveLength(1);

    act(() => {
      voteUpdatedHandler?.('idea-remote', 5, 1);
    });
    expect(result.current.ideas.find((idea) => idea.id === 'idea-remote')?.upvotes).toBe(5);

    act(() => {
      commentCountHandler?.('idea-remote', 12);
    });
    expect(
      result.current.ideas.find((idea) => idea.id === 'idea-remote')?.commentCount,
    ).toBe(12);

    act(() => {
      statusUpdatedHandler?.('idea-remote', 'Approved');
    });
    expect(
      result.current.ideas.find((idea) => idea.id === 'idea-remote')?.status,
    ).toBe('Approved');

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('retrieves individual ideas and clears errors', async () => {
    getIdeaByIdMock.mockResolvedValue(baseIdea);

    const { result } = renderHook(() => useIdeas());

    await act(async () => {
      const idea = await result.current.getIdeaById(baseIdea.id);
      expect(idea).toEqual(baseIdea);
    });

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('rolls back optimistic ideas when creation fails', async () => {
    createIdeaMock.mockRejectedValueOnce('create fail');

    const { result } = renderHook(() => useIdeas());

    await act(async () => {
      await expect(
        result.current.createIdea({
          title: 'Failed idea',
          description: 'desc',
          category: 'Innovation',
        }),
      ).rejects.toBe('create fail');
    });

    expect(result.current.pendingIdeas).toHaveLength(0);
    expect(result.current.error).toBe('Failed to create idea');

    createIdeaMock.mockRejectedValueOnce(new Error('create boom'));

    await act(async () => {
      await expect(
        result.current.createIdea({
          title: 'Error idea',
          description: 'desc',
          category: 'Innovation',
        }),
      ).rejects.toThrow('create boom');
    });

    expect(result.current.error).toBe('create boom');
  });

  it('handles service failures and preserves state', async () => {
    getAllIdeasMock.mockRejectedValue(new Error('load fail'));
    getIdeaByIdMock.mockRejectedValue(new Error('missing idea'));
    updateIdeaMock.mockRejectedValue(new Error('update fail'));
    deleteIdeaMock.mockRejectedValue(new Error('delete fail'));
    getTopIdeasMock.mockRejectedValue(new Error('trending fail'));
    searchIdeasMock.mockRejectedValue('search fail');

    const { result } = renderHook(() => useIdeas());

    await act(async () => {
      await result.current.getIdeas();
    });
    expect(result.current.error).toBe('load fail');

    await act(async () => {
      await expect(result.current.getIdeaById('missing')).rejects.toThrow('missing idea');
    });
    expect(result.current.error).toBe('missing idea');

    await act(async () => {
      await expect(result.current.updateIdea('idea-1', { title: 'x' })).rejects.toThrow(
        'update fail',
      );
    });
    expect(result.current.error).toBe('update fail');

    await act(async () => {
      await expect(result.current.deleteIdea('idea-1')).rejects.toThrow('delete fail');
    });
    expect(result.current.error).toBe('delete fail');

    await act(async () => {
      await result.current.getTrendingIdeas();
    });
    expect(result.current.error).toBe('trending fail');

    await act(async () => {
      await result.current.searchIdeas('query');
    });
    expect(result.current.error).toBe('Failed to search ideas');

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('uses fallback error messaging for non-Error rejections', async () => {
    getAllIdeasMock.mockRejectedValueOnce('boom');
    getIdeaByIdMock.mockRejectedValueOnce('missing');
    updateIdeaMock.mockRejectedValueOnce('update nope');
    deleteIdeaMock.mockRejectedValueOnce('delete nope');
    getTopIdeasMock.mockRejectedValueOnce('trend nope');
    searchIdeasMock.mockRejectedValueOnce('search nope');

    const { result } = renderHook(() => useIdeas());

    await act(async () => {
      await result.current.getIdeas();
    });
    expect(result.current.error).toBe('Failed to load ideas');

    await act(async () => {
      await expect(result.current.getIdeaById('x')).rejects.toBe('missing');
    });
    expect(result.current.error).toBe('Failed to load idea');

    await act(async () => {
      await expect(result.current.updateIdea('x', { title: 't' })).rejects.toBe('update nope');
    });
    expect(result.current.error).toBe('Failed to update idea');

    await act(async () => {
      await expect(result.current.deleteIdea('x')).rejects.toBe('delete nope');
    });
    expect(result.current.error).toBe('Failed to delete idea');

    await act(async () => {
      await result.current.getTrendingIdeas();
    });
    expect(result.current.error).toBe('Failed to load trending ideas');

    await act(async () => {
      await result.current.searchIdeas('term');
    });
    expect(result.current.error).toBe('Failed to search ideas');
  });

  it('logs disconnect failures during cleanup', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    disconnectMock.mockRejectedValueOnce(new Error('disconnect fail'));

    const { unmount } = renderHook(() => useIdeas());

    unmount();

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to disconnect from IdeasHub:',
        expect.any(Error),
      ),
    );

    consoleError.mockRestore();
  });

  it('logs hub connection failures during setup', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    connectMock.mockRejectedValueOnce(new Error('hub fail'));

    const { unmount } = renderHook(() => useIdeas());
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to connect to IdeasHub:',
        expect.any(Error),
      ),
    );

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
