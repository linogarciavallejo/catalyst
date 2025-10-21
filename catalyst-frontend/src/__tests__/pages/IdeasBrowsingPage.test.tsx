import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import IdeasBrowsingPage from '@/pages/IdeasBrowsingPage';
import { useIdeas, useVoting } from '@/hooks';
import type { Idea } from '@/types';
import '@testing-library/jest-dom';

vi.mock('@/hooks', () => ({
  useIdeas: vi.fn(),
  useVoting: vi.fn(),
}));

vi.mock('@/components/features', () => ({
  IdeaCard: ({
    idea,
    onVote,
    onComment,
    isPending,
    isPendingVote,
  }: {
    idea: Idea;
    onVote?: (ideaId: string, type: 'upvote' | 'downvote') => void;
    onComment?: (ideaId: string) => void;
    isPending?: boolean;
    isPendingVote?: boolean;
  }) => (
    <div data-testid={`idea-${idea.id}`}>
      <div>{idea.title}</div>
      <div>{isPending ? 'pending' : 'confirmed'}</div>
      <div>{isPendingVote ? 'vote-pending' : 'vote-ready'}</div>
      <button onClick={() => onVote?.(idea.id, 'upvote')}>Upvote</button>
      <button onClick={() => onVote?.(idea.id, 'downvote')}>Downvote</button>
      <button onClick={() => onComment?.(idea.id)}>Comment</button>
    </div>
  ),
}));

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

afterAll(() => {
  mockConsoleError.mockRestore();
  mockConsoleLog.mockRestore();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <IdeasBrowsingPage />
    </MemoryRouter>
  );

const createIdea = (overrides: Partial<Idea>): Idea => ({
  id: 'idea-1',
  title: 'Idea One',
  description: 'First idea description',
  category: 'Feature',
  status: 'Submitted',
  authorId: 'author-1',
  author: {
    id: 'author-1',
    displayName: 'Author One',
    email: 'author1@example.com',
    role: 'Creator',
    eipPoints: 10,
    createdAt: new Date('2023-01-01T00:00:00Z'),
  },
  upvotes: 10,
  downvotes: 1,
  commentCount: 1,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
  ...overrides,
});

describe('IdeasBrowsingPage', () => {
  const useIdeasMock = useIdeas as unknown as vi.Mock;
  const useVotingMock = useVoting as unknown as vi.Mock;

  const getIdeas = vi.fn();
  const searchIdeas = vi.fn();
  const ideasIsPending = vi.fn();
  const submitVote = vi.fn();
  const voteIsPending = vi.fn();

  let ideasReturn: {
    ideas: Idea[];
    pendingIdeas: Idea[];
    isPending: (id: string) => boolean;
    getIdeas: typeof getIdeas;
    searchIdeas: typeof searchIdeas;
    isLoading: boolean;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
    mockConsoleLog.mockClear();

    ideasIsPending.mockImplementation((id: string) => id.startsWith('pending-'));
    getIdeas.mockResolvedValue(undefined);
    searchIdeas.mockResolvedValue(undefined);
    submitVote.mockResolvedValue(undefined);
    voteIsPending.mockReturnValue(false);

    ideasReturn = {
      ideas: [createIdea({ id: 'idea-1', title: 'Idea One', createdAt: new Date('2024-01-03') })],
      pendingIdeas: [
        createIdea({ id: 'pending-1', title: 'Pending Idea', createdAt: new Date('2024-01-04') }),
      ],
      isPending: ideasIsPending,
      getIdeas,
      searchIdeas,
      isLoading: false,
    };

    useIdeasMock.mockImplementation(() => ideasReturn);

    useVotingMock.mockImplementation(() => ({
      submitVote,
      isPending: voteIsPending,
    }));
  });

  it('loads ideas on mount and combines pending with confirmed ideas', async () => {
    renderPage();

    await waitFor(() => {
      expect(getIdeas).toHaveBeenCalledTimes(1);
    });

    const ideaCards = screen.getAllByTestId(/idea-/i);
    expect(ideaCards[0]).toHaveTextContent('Pending Idea');
    expect(ideaCards[1]).toHaveTextContent('Idea One');
    expect(screen.getByText('Explore 2 ideas from the community')).toBeInTheDocument();
  });

  it('submits votes with normalized types and handles failures gracefully', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByText('Upvote')[0]);

    await waitFor(() => {
      expect(submitVote).toHaveBeenCalledWith('pending-1', 'Upvote');
    });

    await user.click(screen.getAllByText('Downvote')[0]);

    await waitFor(() => {
      expect(submitVote).toHaveBeenCalledWith('pending-1', 'Downvote');
    });

    submitVote.mockRejectedValueOnce(new Error('Vote error'));

    await user.click(screen.getAllByText('Upvote')[0]);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Vote failed:', expect.any(Error));
    });
  });

  it('invokes search and surfaces failures', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText('Search ideas...');

    await user.type(searchInput, 'backend');

    await waitFor(() => {
      expect(searchIdeas).toHaveBeenCalledWith('backend');
    });

    const callsAfterTyping = searchIdeas.mock.calls.length;
    searchIdeas.mockRejectedValueOnce(new Error('Search failed'));

    await user.clear(searchInput);
    expect(searchIdeas.mock.calls.length).toBe(callsAfterTyping);
    await user.type(searchInput, 'error');

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Search failed:', expect.any(Error));
    });
  });

  it('shows loading and empty states appropriately', async () => {
    const state = {
      ideas: [] as Idea[],
      pendingIdeas: [] as Idea[],
      isPending: ideasIsPending,
      getIdeas,
      searchIdeas,
      isLoading: true,
    };

    useIdeasMock.mockImplementation(() => state);

    const view = render(
      <MemoryRouter>
        <IdeasBrowsingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading ideas...')).toBeInTheDocument();

    state.isLoading = false;

    view.rerender(
      <MemoryRouter>
        <IdeasBrowsingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No ideas found')).toBeInTheDocument();
    });

    useIdeasMock.mockImplementation(() => ideasReturn);
  });

  it('applies status and sort filters to the displayed ideas', async () => {
    ideasReturn = {
      ...ideasReturn,
      ideas: [
        createIdea({ id: 'idea-1', title: 'Newest', status: 'Approved', createdAt: new Date('2024-01-03'), upvotes: 3, downvotes: 1, commentCount: 1 }),
        createIdea({ id: 'idea-2', title: 'Popular', status: 'Approved', createdAt: new Date('2024-01-02'), upvotes: 10, downvotes: 0, commentCount: 2 }),
        createIdea({ id: 'idea-3', title: 'Discussed', status: 'Approved', createdAt: new Date('2024-01-01'), upvotes: 1, downvotes: 0, commentCount: 10 }),
      ],
      pendingIdeas: [
        createIdea({ id: 'pending-keep', title: 'Pending idea', status: 'Submitted', createdAt: new Date('2024-01-05') }),
      ],
      isLoading: false,
    };

    renderPage();

    const user = userEvent.setup();

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Approved');
    await user.selectOptions(selects[1], 'popular');

    const ideaCardsAfterPopular = screen.getAllByTestId(/idea-/i);
    const idsAfterPopular = ideaCardsAfterPopular.map((element) => element.getAttribute('data-testid'));
    expect(idsAfterPopular[0]).toBe('idea-pending-keep');
    expect(
      ideaCardsAfterPopular.some((element) => element.textContent?.includes('Popular')),
    ).toBe(true);

    await user.selectOptions(selects[1], 'controversial');
    const ideaCardsAfterControversial = screen.getAllByTestId(/idea-/i);
    const idsAfterControversial = ideaCardsAfterControversial.map((element) => element.getAttribute('data-testid'));
    expect(idsAfterControversial[0]).toBe('idea-pending-keep');
    expect(idsAfterControversial).toContain('idea-idea-3');
  });

  it('supports pagination and comment callbacks', async () => {
    ideasReturn = {
      ...ideasReturn,
      pendingIdeas: [
        createIdea({ id: 'pending-1', title: 'Pending Idea', createdAt: new Date('2024-01-04') }),
      ],
      ideas: [
        createIdea({ id: 'idea-1', title: 'Idea One', createdAt: new Date('2024-01-01') }),
      ],
    };

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByText('Comment')[0]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Comment on idea pending-1');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    expect(screen.getByText('Page 2')).toBeInTheDocument();

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).not.toBeDisabled();

    await user.click(previousButton);
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
  });

  it('logs failures when idea loading fails', async () => {
    getIdeas.mockRejectedValueOnce(new Error('Load ideas failed'));

    renderPage();

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to load ideas:', expect.any(Error));
    });
  });
});
