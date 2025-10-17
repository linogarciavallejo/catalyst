import { useState, useCallback } from "react";
import { IdeasService } from "../services";
import type { Idea, CreateIdeaRequest, IdeaFilters } from "../types";

export interface UseIdeasReturn {
  ideas: Idea[];
  pendingIdeas: Idea[];
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
  isPending: (ideaId: string) => boolean;
  clearError: () => void;
  onIdeaCreated: (callback: (idea: Idea) => void) => void;
}

export const useIdeas = (): UseIdeasReturn => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [pendingIdeas, setPendingIdeas] = useState<Idea[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time event listeners
  const [ideaCreatedListeners, setIdeaCreatedListeners] = useState<
    Array<(idea: Idea) => void>
  >([]);

  const getIdeas = useCallback(async (_filters?: IdeaFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const ideas = await IdeasService.getAllIdeas();
      setIdeas(ideas);
      // Note: If backend supports pagination, update this to handle response structure
      // TODO: Use _filters for advanced filtering when backend supports it
      setTotalPages(1);
      setCurrentPage(1);
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
      return await IdeasService.getIdeaById(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load idea";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const createIdea = useCallback(
    async (request: CreateIdeaRequest): Promise<Idea> => {
      setError(null);

      // Create optimistic idea
      const optimisticIdea: Idea = {
        id: `pending-${Date.now()}`,
        title: request.title,
        description: request.description,
        category: request.category,
        status: 'UnderReview',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: '', // Will be filled by server
        author: {
          id: '',
          displayName: 'You',
          email: '',
          role: 'Contributor',
          eipPoints: 0,
          createdAt: new Date(),
        },
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
      };

      // Show optimistic idea immediately
      setPendingIdeas((prev) => [optimisticIdea, ...prev]);

      try {
        const newIdea = await IdeasService.createIdea(request);
        // Remove from pending and add to confirmed
        setPendingIdeas((prev) =>
          prev.filter((idea) => idea.id !== optimisticIdea.id)
        );
        setIdeas((prev) => [newIdea, ...prev]);
        
        // Notify listeners
        ideaCreatedListeners.forEach((listener) => listener(newIdea));
        
        return newIdea;
      } catch (err) {
        // Rollback on error
        setPendingIdeas((prev) =>
          prev.filter((idea) => idea.id !== optimisticIdea.id)
        );
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create idea";
        setError(errorMessage);
        throw err;
      }
    },
    [ideaCreatedListeners]
  );

  const updateIdea = useCallback(
    async (id: string, request: Partial<CreateIdeaRequest>): Promise<Idea> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await IdeasService.updateIdea(id, request);
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
      await IdeasService.deleteIdea(id);
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
      const trending = await IdeasService.getTopIdeas(limit);
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
      const results = await IdeasService.searchIdeas(query);
      setIdeas(results.slice(0, limit));
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

  const isPending = useCallback((ideaId: string): boolean => {
    return pendingIdeas.some((idea) => idea.id === ideaId);
  }, [pendingIdeas]);

  const onIdeaCreated = useCallback(
    (callback: (idea: Idea) => void) => {
      setIdeaCreatedListeners((prev) => [...prev, callback]);
    },
    []
  );

  return {
    ideas,
    pendingIdeas,
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
    isPending,
    clearError,
    onIdeaCreated,
  };
};
