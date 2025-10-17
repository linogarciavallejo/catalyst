import { apiClient } from "./client";
import type {
  Idea,
  CreateIdeaRequest,
  IdeaFilters,
  ApiResponse,
  PaginatedResponse,
} from "../../types";

export const ideasService = {
  // Get all ideas with filters
  async getIdeas(
    filters?: IdeaFilters
  ): Promise<PaginatedResponse<Idea>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
    }

    return apiClient.get(`/ideas?${params.toString()}`);
  },

  // Get single idea by ID
  async getIdeaById(id: string): Promise<Idea> {
    return apiClient.get(`/ideas/${id}`);
  },

  // Create new idea
  async createIdea(request: CreateIdeaRequest): Promise<Idea> {
    return apiClient.post("/ideas", request as unknown as Record<string, unknown>);
  },

  // Update idea
  async updateIdea(
    id: string,
    request: Partial<CreateIdeaRequest>
  ): Promise<Idea> {
    return apiClient.put(`/ideas/${id}`, request as unknown as Record<string, unknown>);
  },

  // Delete idea
  async deleteIdea(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/ideas/${id}`);
  },

  // Get trending ideas
  async getTrendingIdeas(limit: number = 10): Promise<Idea[]> {
    return apiClient.get(`/ideas/trending?limit=${limit}`);
  },

  // Search ideas
  async searchIdeas(query: string, limit: number = 20): Promise<Idea[]> {
    return apiClient.get(`/ideas/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },
};
