import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ideasService } from '@/services/api/ideas';

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

describe('ideasService API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClientMock.get.mockReset();
    apiClientMock.post.mockReset();
    apiClientMock.put.mockReset();
    apiClientMock.delete.mockReset();
  });

  it('fetches ideas with and without filters', async () => {
    const pageResponse = { items: [], total: 0 } as any;
    apiClientMock.get.mockResolvedValueOnce(pageResponse).mockResolvedValueOnce(pageResponse);

    await expect(ideasService.getIdeas()).resolves.toBe(pageResponse);
    expect(apiClientMock.get).toHaveBeenCalledWith('/ideas?');

    await expect(
      ideasService.getIdeas({ status: 'Open', category: 'Innovation', sortBy: 'Top', search: 'ai', page: 2, pageSize: 25 })
    ).resolves.toBe(pageResponse);
    expect(apiClientMock.get).toHaveBeenCalledWith(
      '/ideas?status=Open&category=Innovation&sortBy=Top&search=ai&page=2&pageSize=25'
    );
  });

  it('retrieves idea details and trending/search data', async () => {
    const idea = { id: '1' } as any;
    apiClientMock.get
      .mockResolvedValueOnce(idea)
      .mockResolvedValueOnce([idea])
      .mockResolvedValueOnce([idea]);

    await expect(ideasService.getIdeaById('idea-1')).resolves.toBe(idea);
    expect(apiClientMock.get).toHaveBeenCalledWith('/ideas/idea-1');

    await expect(ideasService.getTrendingIdeas(5)).resolves.toEqual([idea]);
    expect(apiClientMock.get).toHaveBeenCalledWith('/ideas/trending?limit=5');

    await expect(ideasService.searchIdeas('big idea', 10)).resolves.toEqual([idea]);
    expect(apiClientMock.get).toHaveBeenCalledWith('/ideas/search?q=big%20idea&limit=10');
  });

  it('creates, updates, and deletes ideas', async () => {
    const createRequest = { title: 'Idea' } as any;
    const created = { id: '2' } as any;
    const updated = { id: '2', title: 'Updated' } as any;

    apiClientMock.post.mockResolvedValueOnce(created);
    apiClientMock.put.mockResolvedValueOnce(updated);
    apiClientMock.delete.mockResolvedValueOnce(undefined);

    await expect(ideasService.createIdea(createRequest)).resolves.toBe(created);
    expect(apiClientMock.post).toHaveBeenCalledWith('/ideas', createRequest);

    await expect(ideasService.updateIdea('2', { title: 'Updated' } as any)).resolves.toBe(updated);
    expect(apiClientMock.put).toHaveBeenCalledWith('/ideas/2', expect.objectContaining({ title: 'Updated' }));

    await expect(ideasService.deleteIdea('2')).resolves.toBeUndefined();
    expect(apiClientMock.delete).toHaveBeenCalledWith('/ideas/2');
  });
});
