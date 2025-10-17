import { useState, useCallback } from "react";
import { votesService } from "../services/api/votes";
import type { Vote, VoteType } from "../types";

export interface UseVotingReturn {
  votes: Record<string, Vote>;
  isLoading: boolean;
  error: string | null;
  submitVote: (ideaId: string, voteType: VoteType) => Promise<void>;
  removeVote: (ideaId: string) => Promise<void>;
  getUserVote: (ideaId: string) => Vote | null;
  clearError: () => void;
}

export const useVoting = (): UseVotingReturn => {
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVote = useCallback(
    async (ideaId: string, voteType: VoteType) => {
      setIsLoading(true);
      setError(null);

      try {
        const vote = await votesService.submitVote({
          ideaId,
          voteType,
        });
        setVotes((prev) => ({
          ...prev,
          [ideaId]: vote,
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit vote";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeVote = useCallback(async (ideaId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await votesService.removeVoteByIdea(ideaId);
      setVotes((prev) => {
        const updated = { ...prev };
        delete updated[ideaId];
        return updated;
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove vote";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserVote = useCallback((ideaId: string): Vote | null => {
    return votes[ideaId] ?? null;
  }, [votes]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    votes,
    isLoading,
    error,
    submitVote,
    removeVote,
    getUserVote,
    clearError,
  };
};
