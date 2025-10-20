import { renderHook, act } from '@testing-library/react';
import { useIdeas } from '@/hooks/useIdeas';

const connect = vi.fn().mockResolvedValue(undefined);
const disconnect = vi.fn().mockResolvedValue(undefined);
let ideaCreatedHandler: ((idea: any) => void) | null = null;
const onIdeaCreated = vi.fn((handler: (idea: any) => void) => {
  ideaCreatedHandler = handler;
});

vi.mock('@/services/signalr/hubs/ideasHub', () => ({
  IdeasHub: vi.fn().mockImplementation(() => ({
    connect,
    disconnect,
    onIdeaCreated,
    onVoteUpdated: vi.fn(),
    onCommentCountUpdated: vi.fn(),
    onIdeaStatusUpdated: vi.fn(),
  })),
}));

const getAllIdeas = vi.fn();
const getIdeaById = vi.fn();
const createIdea = vi.fn();
const updateIdea = vi.fn();
const deleteIdea = vi.fn();
const getTopIdeas = vi.fn();
const searchIdeas = vi.fn();

vi.mock('@/services', () => ({
  IdeasService: {
    getAllIdeas: (...args: unknown[]) => getAllIdeas(...args),
    getIdeaById: (...args: unknown[]) => getIdeaById(...args),
    createIdea: (...args: unknown[]) => createIdea(...args),
    updateIdea: (...args: unknown[]) => updateIdea(...args),
    deleteIdea: (...args: unknown[]) => deleteIdea(...args),
    getTopIdeas: (...args: unknown[]) => getTopIdeas(...args),
    searchIdeas: (...args: unknown[]) => searchIdeas(...args),
  },
}));

const baseIdea = {
  id: 'idea-1',
  title: 'First idea',
  description: 'Description',
  category: 'Innovation',
  status: 'submitted',
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

describe('useIdeas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ideaCreatedHandler = null;
  });

  it('loads ideas and handles optimistic creation', async () => {
    getAllIdeas.mockResolvedValue([baseIdea]);
    createIdea.mockResolvedValue({ ...baseIdea, id: 'idea-2' });

    const { result } = renderHook(() => useIdeas());

    await act(async () => {
      await result.current.getIdeas();
    });

    expect(result.current.ideas).toHaveLength(1);

    await act(async () => {
      await result.current.createIdea({
        title: 'New idea',
        description: 'Desc',
        category: 'Innovation',
      });
    });

    expect(result.current.pendingIdeas).toHaveLength(0);
    expect(result.current.ideas[0]?.id).toBe('idea-2');
  });

  it('rolls back optimistic create failures', async () => {
    createIdea.mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useIdeas());

    await act(async () => {
      await expect(
        result.current.createIdea({
          title: 'New idea',
          description: 'Desc',
          category: 'Innovation',
        })
      ).rejects.toThrow('Failed');
    });

    expect(result.current.pendingIdeas).toHaveLength(0);
    expect(result.current.error).toBe('Failed');
  });

  it('updates, deletes, searches, and reacts to hub events', async () => {
    getAllIdeas.mockResolvedValue([baseIdea]);
    updateIdea.mockResolvedValue({ ...baseIdea, title: 'Updated' });
    deleteIdea.mockResolvedValue(undefined);
    getTopIdeas.mockResolvedValue([baseIdea]);
    searchIdeas.mockResolvedValue([baseIdea, { ...baseIdea, id: 'idea-3' }]);

    const { result } = renderHook(() => useIdeas());

    await act(async () => {
      await result.current.getIdeas();
    });

    await act(async () => {
      await result.current.updateIdea('idea-1', { title: 'Updated' });
    });
    expect(result.current.ideas[0]?.title).toBe('Updated');

    await act(async () => {
      await result.current.deleteIdea('idea-1');
    });
    expect(result.current.ideas).toHaveLength(0);

    await act(async () => {
      await result.current.getTrendingIdeas();
      await result.current.searchIdeas('idea', 1);
    });
    expect(searchIdeas).toHaveBeenCalledWith('idea');
    expect(result.current.ideas).toHaveLength(1);

    const onCreated = vi.fn();
    act(() => {
      result.current.onIdeaCreated(onCreated);
    });
    ideaCreatedHandler?.({ ...baseIdea, id: 'idea-new' });
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 'idea-new' }));
  });
});
