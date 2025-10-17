import { useState, useCallback } from "react";
import { VotesService } from "../services";
import type { Vote, VoteType } from "../types";

export interface UseVotingReturn {
  votes: Record<string, Vote>;
  pendingVotes: Record<string, VoteType>; // Track optimistic votes
  isLoading: boolean;
  error: string | null;
  submitVote: (ideaId: string, voteType: VoteType) => Promise<void>;
  removeVote: (ideaId: string) => Promise<void>;
  getUserVote: (ideaId: string) => Vote | null;
  isPending: (ideaId: string) => boolean;
  clearError: () => void;
}

export const useVoting = (): UseVotingReturn => {
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, VoteType>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVote = useCallback(
    async (ideaId: string, voteType: VoteType) => {
      setError(null);

      // Optimistic update: show vote immediately
      setPendingVotes((prev) => ({
        ...prev,
        [ideaId]: voteType,
      }));

      try {
        setIsLoading(true);
        await VotesService.vote(ideaId, voteType);
        const userVote = await VotesService.getUserVoteForIdea(ideaId);
        if (userVote) {
          setVotes((prev) => ({
            ...prev,
            [ideaId]: userVote,
          }));
        }
        // Remove from pending once confirmed
        setPendingVotes((prev) => {
          const updated = { ...prev };
          delete updated[ideaId];
          return updated;
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit vote";
        setError(errorMessage);
        // Rollback optimistic update on error
        setPendingVotes((prev) => {
          const updated = { ...prev };
          delete updated[ideaId];
          return updated;
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeVote = useCallback(async (ideaId: string) => {
    setError(null);

    // Optimistic update: remove vote immediately
    const previousVotes = votes;
    setVotes((prev) => {
      const updated = { ...prev };
      delete updated[ideaId];
      return updated;
    });

    try {
      setIsLoading(true);
      await VotesService.removeVote(ideaId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove vote";
      setError(errorMessage);
      // Rollback optimistic update on error
      setVotes(previousVotes);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [votes]);

  const getUserVote = useCallback((ideaId: string): Vote | null => {
    return votes[ideaId] ?? null;
  }, [votes]);

  const isPending = useCallback((ideaId: string): boolean => {
    return ideaId in pendingVotes;
  }, [pendingVotes]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    votes,
    pendingVotes,
    isLoading,
    error,
    submitVote,
    removeVote,
    getUserVote,
    isPending,
    clearError,
  };
};
