import { ApiClient, ApiErrorHandler } from './api';
import type { Idea, CreateIdeaRequest } from '@/types';

/**
 * Ideas API Service
 * Handles all idea-related API calls
 */
export class IdeasService {
  private static readonly endpoint = '/ideas';

  /**
   * Get all ideas
   */
  static async getAllIdeas(): Promise<Idea[]> {
    try {
      const response = await ApiClient.getInstance().get<Idea[]>(
        this.endpoint
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Get idea by ID
   */
  static async getIdeaById(id: string): Promise<Idea> {
    try {
      const response = await ApiClient.getInstance().get<Idea>(
        `${this.endpoint}/${id}`
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Search ideas by title
   */
  static async searchIdeas(searchTerm: string): Promise<Idea[]> {
    try {
      const response = await ApiClient.getInstance().get<Idea[]>(
        `${this.endpoint}/search/${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Get ideas by category
   */
  static async getIdeasByCategory(category: string): Promise<Idea[]> {
    try {
      const response = await ApiClient.getInstance().get<Idea[]>(
        `${this.endpoint}/category/${encodeURIComponent(category)}`
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Get top ideas by votes
   */
  static async getTopIdeas(limit: number = 10): Promise<Idea[]> {
    try {
      const response = await ApiClient.getInstance().get<Idea[]>(
        `${this.endpoint}/top/${limit}`
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Create a new idea
   */
  static async createIdea(request: CreateIdeaRequest): Promise<Idea> {
    try {
      const response = await ApiClient.getInstance().post<Idea>(
        this.endpoint,
        request
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Update an idea
   */
  static async updateIdea(id: string, data: Partial<Idea>): Promise<Idea> {
    try {
      const response = await ApiClient.getInstance().put<Idea>(
        `${this.endpoint}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Delete an idea
   */
  static async deleteIdea(id: string): Promise<void> {
    try {
      await ApiClient.getInstance().delete(`${this.endpoint}/${id}`);
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }
}

export default IdeasService;
