import React from 'react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import IdeaDetailPage from '@/pages/IdeaDetailPage';
import { useIdeas, useVoting, useComments, useActivity } from '@/hooks';
import type { Idea, Comment } from '@/types';
import '@testing-library/jest-dom';

vi.mock('@/hooks', () => ({
  useIdeas: vi.fn(),
  useVoting: vi.fn(),
  useComments: vi.fn(),
  useActivity: vi.fn(),
}));

vi.mock('@/components/features', async () => {
  const actual = await vi.importActual<any>('@/components/features');
  return {
    ...actual,
    VoteButton: ({ onVote }: { onVote?: (voteType: string) => Promise<void> | void }) => (
      <div>
        <button data-testid="vote-up" onClick={() => onVote?.('upvote')}>
          Upvote
        </button>
        <button data-testid="vote-invalid" onClick={() => onVote?.('invalid')}>
          Invalid Vote
        </button>
      </div>
    ),
    UserProfile: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="user-profile">{children}</div>
    ),
  };
});

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  mockConsoleError.mockRestore();
});

const createIdea = (): Idea => ({
  id: 'idea-1',
  title: 'Innovative Idea',
  description: 'A detailed plan to innovate.',
  category: 'Innovation',
  status: 'Approved',
  authorId: 'author-1',
  author: {
    id: 'author-1',
    email: 'author@example.com',
    displayName: 'Author Name',
    role: 'Creator',
    eipPoints: 120,
    createdAt: new Date('2023-01-01T00:00:00Z'),
  },
  upvotes: 42,
  downvotes: 3,
  commentCount: 2,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-02-01T00:00:00Z'),
});

const createComment = (id: string, content: string): Comment => ({
  id,
  ideaId: 'idea-1',
  authorId: 'commenter-1',
  author: {
    id: 'commenter-1',
    email: 'commenter@example.com',
    displayName: 'Commenter',
    role: 'Contributor',
    eipPoints: 10,
    createdAt: new Date('2023-03-01T00:00:00Z'),
  },
  content,
  createdAt: new Date('2024-03-01T00:00:00Z'),
  updatedAt: new Date('2024-03-02T00:00:00Z'),
});

const renderIdeaDetailPage = (initialRoute = '/ideas/idea-1') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/ideas/:ideaId" element={<IdeaDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('IdeaDetailPage', () => {
  const loadIdea = vi.fn();
  const submitVote = vi.fn();
  const getComments = vi.fn();
  const addComment = vi.fn();
  const startTyping = vi.fn();
  const stopTyping = vi.fn();
  const setViewingIdea = vi.fn();

  let comments: Comment[];
  let pendingComments: Comment[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();

    comments = [createComment('comment-1', 'First comment')];
    pendingComments = [
      {
        ...createComment('pending-1', 'Pending comment'),
        id: 'pending-1',
        author: {
          id: 'pending-user',
          email: 'you@example.com',
          displayName: 'You',
          role: 'Creator',
          eipPoints: 0,
          createdAt: new Date('2024-03-03T00:00:00Z'),
        },
      },
    ];

    loadIdea.mockResolvedValue(createIdea());
    submitVote.mockResolvedValue(undefined);
    getComments.mockResolvedValue(undefined);
    addComment.mockResolvedValue({
      ...createComment('comment-2', 'New comment'),
      author: {
        id: 'commenter-2',
        email: 'second@example.com',
        displayName: 'Second User',
        role: 'Contributor',
        eipPoints: 8,
        createdAt: new Date('2023-04-01T00:00:00Z'),
      },
    });

    startTyping.mockClear();
    stopTyping.mockClear();
    setViewingIdea.mockClear();

    (useIdeas as unknown as vi.Mock).mockReturnValue({
      getIdeaById: loadIdea,
    });

    (useVoting as unknown as vi.Mock).mockReturnValue({
      submitVote,
    });

    (useComments as unknown as vi.Mock).mockReturnValue({
      comments,
      pendingComments,
      isLoading: false,
      error: null,
      getComments,
      addComment,
      updateComment: vi.fn(),
      deleteComment: vi.fn(),
      getCommentCount: vi.fn(),
      isPending: vi.fn(),
      clearError: vi.fn(),
    });

    (useActivity as unknown as vi.Mock).mockReturnValue({
      typingUsers: {
        'idea-1': ['Taylor'],
      },
      viewingUsers: {
        'idea-1': ['Morgan'],
      },
      activeUsers: [],
      startTyping,
      stopTyping,
      setViewingIdea,
      setIdle: vi.fn(),
    });
  });

  it('shows loading state while data is fetching', () => {
    loadIdea.mockReturnValue(new Promise(() => {}));

    renderIdeaDetailPage();

    expect(screen.getByText('Loading idea...')).toBeInTheDocument();
    expect(setViewingIdea).toHaveBeenCalledWith('idea-1');
  });

  it('renders error state when idea is missing', async () => {
    loadIdea.mockResolvedValueOnce(null);

    renderIdeaDetailPage();

    await waitFor(() => {
      expect(screen.getByText('Idea not found')).toBeInTheDocument();
    });
    expect(getComments).not.toHaveBeenCalled();
  });

  it('renders idea details, presence, and comments when load succeeds', async () => {
    renderIdeaDetailPage();

    expect(await screen.findByText('Innovative Idea')).toBeInTheDocument();
    expect(screen.getByText('A detailed plan to innovate.')).toBeInTheDocument();
    expect(getComments).toHaveBeenCalledWith('idea-1');
    expect(screen.getByText('Morgan viewing')).toBeInTheDocument();
    expect(screen.getByText('Taylor is typing...')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Posting...')).toBeInTheDocument();
  });

  it('submits an upvote and reloads the idea', async () => {
    renderIdeaDetailPage();

    const voteButton = await screen.findByTestId('vote-up');
    const user = userEvent.setup();
    await user.click(voteButton);

    await waitFor(() => {
      expect(submitVote).toHaveBeenCalledWith('idea-1', 'Upvote');
    });

    expect(loadIdea).toHaveBeenCalledTimes(2);
  });

  it('logs an error when vote type is invalid', async () => {
    renderIdeaDetailPage();

    const invalidVote = await screen.findByTestId('vote-invalid');
    const user = userEvent.setup();
    await user.click(invalidVote);

    expect(submitVote).not.toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith('Failed to vote:', expect.any(Error));
  });

  it('submits a comment, resets the input, and refreshes comments', async () => {
    renderIdeaDetailPage();

    const commentInput = await screen.findByTestId('comment-input');
    const submitButton = screen.getByTestId('submit-comment');
    const user = userEvent.setup();

    await user.type(commentInput, 'Great idea!');
    expect(startTyping).toHaveBeenCalledWith('idea-1');

    let resolveAdd: ((value: Comment) => void) | undefined;
    const addPromise = new Promise<Comment>((resolve) => {
      resolveAdd = resolve;
    });
    addComment.mockReturnValueOnce(addPromise);

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Posting...');
    });

    resolveAdd?.(createComment('comment-3', 'Deferred comment'));

    await waitFor(() => {
      expect(getComments).toHaveBeenCalledWith('idea-1');
    });

    expect(commentInput).toHaveValue('');

    commentInput.blur();
    expect(stopTyping).toHaveBeenCalledWith('idea-1');
  });

  it('keeps comment text and logs when submission fails', async () => {
    addComment.mockRejectedValueOnce(new Error('nope'));
    renderIdeaDetailPage();

    const commentInput = await screen.findByTestId('comment-input');
    const submitButton = screen.getByTestId('submit-comment');
    const user = userEvent.setup();

    await user.type(commentInput, 'Will fail');
    await user.click(submitButton);

    await waitFor(() => {
      expect(addComment).toHaveBeenCalledWith({ ideaId: 'idea-1', content: 'Will fail' });
    });

    expect(commentInput).toHaveValue('Will fail');
    expect(getComments).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith('Failed to add comment:', expect.any(Error));
  });

  it('prevents submitting blank comments', async () => {
    renderIdeaDetailPage();

    const commentInput = await screen.findByTestId('comment-input');
    const form = commentInput.closest('form');
    const user = userEvent.setup();

    await screen.findByText('Innovative Idea');
    await user.type(commentInput, '   ');

    fireEvent.submit(form!);

    expect(addComment).not.toHaveBeenCalled();
    expect(commentInput).toHaveValue('   ');
  });

  it('shows a generic error when loading the idea fails', async () => {
    loadIdea.mockRejectedValueOnce(new Error('boom'));

    renderIdeaDetailPage();

    await waitFor(() => {
      expect(screen.getByText('Failed to load idea')).toBeInTheDocument();
    });

    expect(mockConsoleError).toHaveBeenCalledWith('Failed to load idea:', expect.any(Error));
  });

  it.each([
    ['UnderReview', 'bg-yellow-100', 'text-yellow-800'],
    ['Rejected', 'bg-red-100', 'text-red-800'],
    ['InProgress', 'bg-gray-100', 'text-gray-800'],
  ] as const)('applies status styling for %s ideas', async (status, bgClass, textClass) => {
    loadIdea.mockResolvedValueOnce({
      ...createIdea(),
      status: status as Idea['status'],
    });

    renderIdeaDetailPage();

    const badge = await screen.findByText(status, { selector: 'span' });
    expect(badge).toHaveClass(bgClass);
    expect(badge).toHaveClass(textClass);
  });
});

