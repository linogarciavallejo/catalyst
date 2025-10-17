import { useState, useCallback, useEffect } from "react";
import { VotesService } from "../services";
import { VotesHub } from "../services/signalr/hubs/votesHub";
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

  // Set up real-time listeners from SignalR
  useEffect(() => {
    const votesHub = new VotesHub();
    
    // Connect to SignalR hub
    votesHub.connect().catch((err) => {
      console.error("Failed to connect to VotesHub:", err);
    });

    // Listen for vote updates from other users
    votesHub.onVoteUpdated((ideaId: string, upvotes: number, downvotes: number) => {
      // Update vote counts in real-time (but don't change user's own vote)
      setVotes((prev) => {
        // Only update if we don't have this vote pending (to avoid conflicting with optimistic updates)
        if (!(ideaId in pendingVotes)) {
          const currentVote = prev[ideaId];
          if (currentVote) {
            // Update but preserve the vote type
            return {
              ...prev,
              [ideaId]: {
                ...currentVote,
                upvoteCount: upvotes,
                downvoteCount: downvotes,
              },
            };
          }
        }
        return prev;
      });
    });

    // Cleanup on unmount
    return () => {
      votesHub.disconnect().catch((err) => {
        console.error("Failed to disconnect from VotesHub:", err);
      });
    };
  }, [pendingVotes]);

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
