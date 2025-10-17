import { useState, useCallback, useEffect } from "react";
import { commentsService } from "../services/api/comments";
import { CommentsHub } from "../services/signalr/hubs/commentsHub";
import type { Comment, CreateCommentRequest } from "../types";

export interface UseCommentsReturn {
  comments: Comment[];
  pendingComments: Comment[]; // Track optimistic comments
  isLoading: boolean;
  error: string | null;
  getComments: (ideaId: string) => Promise<void>;
  addComment: (request: CreateCommentRequest) => Promise<Comment>;
  updateComment: (id: string, content: string) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  getCommentCount: (ideaId: string) => Promise<number>;
  isPending: (commentId: string) => boolean;
  clearError: () => void;
}

export const useComments = (): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time listeners from SignalR
  useEffect(() => {
    const commentsHub = new CommentsHub();
    
    // Connect to SignalR hub
    commentsHub.connect().catch((err) => {
      console.error("Failed to connect to CommentsHub:", err);
    });

    // Listen for new comments added by other users
    commentsHub.onCommentAdded((newComment: Comment) => {
      // Add to comments list if not already there (avoid duplicates with optimistic adds)
      setComments((prev) => {
        const exists = prev.some((comment) => comment.id === newComment.id);
        if (exists) return prev;
        return [newComment, ...prev];
      });
    });

    // Listen for comment updates
    commentsHub.onCommentUpdated((updatedComment: Comment) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        )
      );
    });

    // Listen for comment deletions
    commentsHub.onCommentDeleted((commentId: string) => {
      setComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
    });

    // Cleanup on unmount
    return () => {
      commentsHub.disconnect().catch((err) => {
        console.error("Failed to disconnect from CommentsHub:", err);
      });
    };
  }, []);

  const getComments = useCallback(async (ideaId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await commentsService.getComments(ideaId);
      setComments(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load comments";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(
    async (request: CreateCommentRequest): Promise<Comment> => {
      setError(null);

      // Create optimistic comment
      const optimisticComment: Comment = {
        id: `pending-${Date.now()}`,
        ideaId: request.ideaId,
        authorId: '', // Will be filled by server
        author: {
          id: '',
          displayName: 'You',
          email: '',
          role: 'Creator',
          eipPoints: 0,
          createdAt: new Date(),
        },
        content: request.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Show optimistic comment immediately
      setPendingComments((prev) => [...prev, optimisticComment]);

      try {
        const newComment = await commentsService.addComment(request);
        // Add real comment
        setComments((prev) => [...prev, newComment]);
        // Remove optimistic comment
        setPendingComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id)
        );
        return newComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add comment";
        setError(errorMessage);
        // Remove optimistic comment on error
        setPendingComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id)
        );
        throw err;
      }
    },
    []
  );

  const updateComment = useCallback(
    async (id: string, content: string): Promise<Comment> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await commentsService.updateComment(id, content);
        setComments((prev) =>
          prev.map((comment) => (comment.id === id ? updated : comment))
        );
        return updated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update comment";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await commentsService.deleteComment(id);
      setComments((prev) => prev.filter((comment) => comment.id !== id));
      setPendingComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete comment";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCommentCount = useCallback(
    async (ideaId: string): Promise<number> => {
      try {
        return await commentsService.getCommentCount(ideaId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get comment count";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const isPending = useCallback(
    (commentId: string): boolean => {
      return pendingComments.some((c) => c.id === commentId);
    },
    [pendingComments]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    comments,
    pendingComments,
    isLoading,
    error,
    getComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentCount,
    isPending,
    clearError,
  };
};
