import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useVoting } from '@/hooks/useVoting';
import type { Vote } from '@/types';

const connectMock = vi.fn();
const disconnectMock = vi.fn();
let voteUpdatedHandler:
  | ((ideaId: string, upvotes: number, downvotes: number) => void)
  | null = null;

const onVoteUpdatedMock = vi.fn(
  (handler: (ideaId: string, upvotes: number, downvotes: number) => void) => {
    voteUpdatedHandler = handler;
  },
);

vi.mock('@/services/signalr/hubs/votesHub', () => ({
  VotesHub: vi.fn().mockImplementation(() => ({
    connect: connectMock,
    disconnect: disconnectMock,
    onVoteUpdated: onVoteUpdatedMock,
    onVoteRemoved: vi.fn(),
  })),
}));

const voteMock = vi.fn();
const getUserVoteMock = vi.fn();
const removeVoteMock = vi.fn();

vi.mock('@/services', () => ({
  VotesService: {
    vote: (...args: unknown[]) => voteMock(...args),
    getUserVoteForIdea: (...args: unknown[]) => getUserVoteMock(...args),
    removeVote: (...args: unknown[]) => removeVoteMock(...args),
  },
}));

describe('useVoting', () => {
  beforeEach(() => {
    connectMock.mockReset();
    connectMock.mockResolvedValue(undefined);
    disconnectMock.mockReset();
    disconnectMock.mockResolvedValue(undefined);
    onVoteUpdatedMock.mockClear();
    voteUpdatedHandler = null;

    voteMock.mockReset();
    getUserVoteMock.mockReset();
    removeVoteMock.mockReset();
  });

  it('submits votes, hydrates state, and responds to hub updates', async () => {
    let resolveSubmit: (() => void) | null = null;
    voteMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const userVote: Vote = {
      id: 'vote-1',
      ideaId: 'idea-1',
      userId: 'user',
      voteType: 'upvote',
      upvoteCount: 3,
      downvoteCount: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };
    getUserVoteMock.mockResolvedValue(userVote);

    const { result, unmount } = renderHook(() => useVoting());

    let submitPromise!: Promise<void>;
    await act(async () => {
      submitPromise = result.current.submitVote('idea-1', 'upvote');
    });
    await waitFor(() => expect(result.current.isPending('idea-1')).toBe(true));
    resolveSubmit?.();
    await act(async () => {
      await submitPromise;
    });

    expect(voteMock).toHaveBeenCalledWith('idea-1', 'upvote');
    expect(getUserVoteMock).toHaveBeenCalledWith('idea-1');
    expect(result.current.getUserVote('idea-1')).toEqual(userVote);
    expect(result.current.isPending('idea-1')).toBe(false);
    expect(result.current.error).toBeNull();

    await act(async () => {
      voteUpdatedHandler?.('idea-1', 10, 2);
    });
    expect(result.current.getUserVote('idea-1')?.upvoteCount).toBe(10);

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('ignores hub updates while a vote is pending and applies them after resolution', async () => {
    let resolveVote: (() => void) | null = null;
    voteMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveVote = resolve;
        }),
    );
    const storedVote: Vote = {
      id: 'vote-2',
      ideaId: 'idea-2',
      userId: 'user',
      voteType: 'downvote',
      upvoteCount: 2,
      downvoteCount: 5,
      createdAt: new Date('2024-01-02T00:00:00Z'),
    };
    getUserVoteMock.mockResolvedValue(storedVote);

    const { result } = renderHook(() => useVoting());

    let submitPromise!: Promise<void>;
    await act(async () => {
      submitPromise = result.current.submitVote('idea-2', 'downvote');
    });

    await waitFor(() => expect(result.current.isPending('idea-2')).toBe(true));
    act(() => {
      voteUpdatedHandler?.('idea-2', 8, 9);
    });
    expect(result.current.getUserVote('idea-2')).toBeNull();
    resolveVote?.();
    await act(async () => {
      await submitPromise;
    });

    expect(result.current.getUserVote('idea-2')).toEqual(storedVote);

    await act(async () => {
      voteUpdatedHandler?.('idea-2', 11, 4);
    });
    expect(result.current.getUserVote('idea-2')?.downvoteCount).toBe(4);
  });

  it('rolls back when submitting or removing votes fails', async () => {
    voteMock.mockRejectedValue(new Error('vote fail'));

    const { result } = renderHook(() => useVoting());

    await act(async () => {
      await expect(result.current.submitVote('idea-3', 'upvote')).rejects.toThrow('vote fail');
    });

    expect(result.current.error).toBe('vote fail');
    expect(result.current.isPending('idea-3')).toBe(false);

    voteMock.mockResolvedValue(undefined);
    getUserVoteMock.mockResolvedValue({
      id: 'vote-4',
      ideaId: 'idea-4',
      userId: 'user',
      voteType: 'upvote',
      upvoteCount: 1,
      downvoteCount: 0,
      createdAt: new Date('2024-01-03T00:00:00Z'),
    });

    await act(async () => {
      await result.current.submitVote('idea-4', 'upvote');
    });

    removeVoteMock.mockResolvedValue(undefined);
    await act(async () => {
      await result.current.removeVote('idea-4');
    });
    expect(result.current.getUserVote('idea-4')).toBeNull();

    getUserVoteMock.mockResolvedValue({
      id: 'vote-5',
      ideaId: 'idea-5',
      userId: 'user',
      voteType: 'downvote',
      upvoteCount: 0,
      downvoteCount: 2,
      createdAt: new Date('2024-01-04T00:00:00Z'),
    });
    await act(async () => {
      await result.current.submitVote('idea-5', 'downvote');
    });

    removeVoteMock.mockRejectedValueOnce(new Error('remove fail'));
    await act(async () => {
      await expect(result.current.removeVote('idea-5')).rejects.toThrow('remove fail');
    });
    expect(result.current.error).toBe('remove fail');
    expect(result.current.getUserVote('idea-5')).not.toBeNull();

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
});
