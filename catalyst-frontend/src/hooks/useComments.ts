import { useState, useCallback } from "react";
import { commentsService } from "../services/api/comments";
import type { Comment, CreateCommentRequest } from "../types";

export interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  getComments: (ideaId: string) => Promise<void>;
  addComment: (request: CreateCommentRequest) => Promise<Comment>;
  updateComment: (id: string, content: string) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  getCommentCount: (ideaId: string) => Promise<number>;
  clearError: () => void;
}

export const useComments = (): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setIsLoading(true);
      setError(null);

      try {
        const newComment = await commentsService.addComment(request);
        setComments((prev) => [...prev, newComment]);
        return newComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add comment";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    comments,
    isLoading,
    error,
    getComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentCount,
    clearError,
  };
};
