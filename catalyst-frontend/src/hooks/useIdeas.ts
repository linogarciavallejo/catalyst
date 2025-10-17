import { useState, useCallback } from "react";
import { ideasService } from "../services/api/ideas";
import type { Idea, CreateIdeaRequest, IdeaFilters } from "../types";

export interface UseIdeasReturn {
  ideas: Idea[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  getIdeas: (filters?: IdeaFilters) => Promise<void>;
  getIdeaById: (id: string) => Promise<Idea>;
  createIdea: (request: CreateIdeaRequest) => Promise<Idea>;
  updateIdea: (id: string, request: Partial<CreateIdeaRequest>) => Promise<Idea>;
  deleteIdea: (id: string) => Promise<void>;
  getTrendingIdeas: (limit?: number) => Promise<void>;
  searchIdeas: (query: string, limit?: number) => Promise<void>;
  clearError: () => void;
}

export const useIdeas = (): UseIdeasReturn => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIdeas = useCallback(async (filters?: IdeaFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ideasService.getIdeas(filters);
      setIdeas(response.items);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load ideas";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getIdeaById = useCallback(async (id: string): Promise<Idea> => {
    try {
      return await ideasService.getIdeaById(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load idea";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const createIdea = useCallback(
    async (request: CreateIdeaRequest): Promise<Idea> => {
      setIsLoading(true);
      setError(null);

      try {
        const newIdea = await ideasService.createIdea(request);
        setIdeas((prev) => [newIdea, ...prev]);
        return newIdea;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create idea";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateIdea = useCallback(
    async (id: string, request: Partial<CreateIdeaRequest>): Promise<Idea> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await ideasService.updateIdea(id, request);
        setIdeas((prev) =>
          prev.map((idea) => (idea.id === id ? updated : idea))
        );
        return updated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update idea";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteIdea = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await ideasService.deleteIdea(id);
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete idea";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTrendingIdeas = useCallback(async (limit = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const trending = await ideasService.getTrendingIdeas(limit);
      setIdeas(trending);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load trending ideas";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchIdeas = useCallback(async (query: string, limit = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await ideasService.searchIdeas(query, limit);
      setIdeas(results);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search ideas";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ideas,
    totalPages,
    currentPage,
    isLoading,
    error,
    hasMore: currentPage < totalPages,
    getIdeas,
    getIdeaById,
    createIdea,
    updateIdea,
    deleteIdea,
    getTrendingIdeas,
    searchIdeas,
    clearError,
  };
};
