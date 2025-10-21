import { describe, it, expect, beforeEach, vi } from 'vitest';
import IdeasService from '@/services/ideasService';

const apiMocks = vi.hoisted(() => ({
  client: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

describe('IdeasService', () => {
  const handledError = { status: 500, message: 'handled' };

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.client.get.mockReset();
    apiMocks.client.post.mockReset();
    apiMocks.client.put.mockReset();
    apiMocks.client.delete.mockReset();
    apiMocks.handle.mockReset();
    apiMocks.handle.mockImplementation(() => handledError);
  });

  it('retrieves ideas via the API endpoints', async () => {
    const idea = { id: '1' } as any;
    apiMocks.client.get
      .mockResolvedValueOnce({ data: [idea] })
      .mockResolvedValueOnce({ data: idea })
      .mockResolvedValueOnce({ data: [idea] })
      .mockResolvedValueOnce({ data: [idea] });

    await expect(IdeasService.getAllIdeas()).resolves.toEqual([idea]);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/ideas');

    await expect(IdeasService.getIdeaById('idea-1')).resolves.toBe(idea);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/ideas/idea-1');

    await expect(IdeasService.searchIdeas('test term')).resolves.toEqual([idea]);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/ideas/search/test%20term');

    await expect(IdeasService.getIdeasByCategory('innovation')).resolves.toEqual([idea]);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/ideas/category/innovation');
  });

  it('fetches top ideas with default and overridden limits', async () => {
    const idea = { id: '1' } as any;
    apiMocks.client.get
      .mockResolvedValueOnce({ data: [idea] })
      .mockResolvedValueOnce({ data: [idea] });

    await expect(IdeasService.getTopIdeas()).resolves.toEqual([idea]);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/ideas/top/10');

    await expect(IdeasService.getTopIdeas(5)).resolves.toEqual([idea]);
    expect(apiMocks.client.get).toHaveBeenCalledWith('/ideas/top/5');
  });

  it('creates, updates, and deletes ideas', async () => {
    const created = { id: '2' } as any;
    const updated = { id: '2', title: 'Updated' } as any;

    apiMocks.client.post.mockResolvedValueOnce({ data: created });
    apiMocks.client.put.mockResolvedValueOnce({ data: updated });
    apiMocks.client.delete.mockResolvedValueOnce(undefined);

    await expect(IdeasService.createIdea({ title: 'Idea' } as any)).resolves.toBe(created);
    expect(apiMocks.client.post).toHaveBeenCalledWith('/ideas', { title: 'Idea' });

    await expect(IdeasService.updateIdea('2', { title: 'Updated' })).resolves.toBe(updated);
    expect(apiMocks.client.put).toHaveBeenCalledWith('/ideas/2', { title: 'Updated' });

    await expect(IdeasService.deleteIdea('2')).resolves.toBeUndefined();
    expect(apiMocks.client.delete).toHaveBeenCalledWith('/ideas/2');
  });

  it('translates API errors through the error handler', async () => {
    apiMocks.client.get
      .mockRejectedValueOnce('boom')
      .mockRejectedValueOnce('detail-fail')
      .mockRejectedValueOnce('search-fail')
      .mockRejectedValueOnce('category-fail')
      .mockRejectedValueOnce('top-fail');

    await expect(IdeasService.getAllIdeas()).rejects.toBe(handledError);
    expect(apiMocks.handle).toHaveBeenCalledWith('boom');

    await expect(IdeasService.getIdeaById('idea-1')).rejects.toBe(handledError);
    expect(apiMocks.handle).toHaveBeenCalledWith('detail-fail');

    await expect(IdeasService.searchIdeas('query')).rejects.toBe(handledError);
    expect(apiMocks.handle).toHaveBeenCalledWith('search-fail');

    await expect(IdeasService.getIdeasByCategory('category')).rejects.toBe(
      handledError
    );
    expect(apiMocks.handle).toHaveBeenCalledWith('category-fail');

    await expect(IdeasService.getTopIdeas()).rejects.toBe(handledError);
    expect(apiMocks.handle).toHaveBeenCalledWith('top-fail');

    apiMocks.client.post.mockRejectedValueOnce('create-fail');
    await expect(IdeasService.createIdea({} as any)).rejects.toBe(handledError);

    apiMocks.client.put.mockRejectedValueOnce('update-fail');
    await expect(IdeasService.updateIdea('x', {})).rejects.toBe(handledError);

    apiMocks.client.delete.mockRejectedValueOnce('delete-fail');
    await expect(IdeasService.deleteIdea('x')).rejects.toBe(handledError);
  });
});
