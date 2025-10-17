import { ApiClient, ApiErrorHandler } from './api';

export interface Vote {
  id: string;
  ideaId: string;
  userId: string;
  voteType: 'Upvote' | 'Downvote';
  createdAt: Date;
}

/**
 * Votes API Service
 * Handles all voting-related API calls
 */
export class VotesService {
  private static readonly endpoint = '/votes';

  /**
   * Get votes for an idea
   */
  static async getVotesForIdea(ideaId: string): Promise<Vote[]> {
    try {
      const response = await ApiClient.getInstance().get<Vote[]>(
        `${this.endpoint}/idea/${ideaId}`
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Get user's vote for an idea
   */
  static async getUserVoteForIdea(ideaId: string): Promise<Vote | null> {
    try {
      const response = await ApiClient.getInstance().get<Vote>(
        `${this.endpoint}/idea/${ideaId}/user`
      );
      return response.data;
    } catch (error) {
      // 404 is expected if user hasn't voted
      const err = ApiErrorHandler.handle(error);
      if (err.status === 404) return null;
      throw err;
    }
  }

  /**
   * Create or update a vote
   */
  static async vote(ideaId: string, voteType: 'Upvote' | 'Downvote'): Promise<Vote> {
    try {
      const response = await ApiClient.getInstance().post<Vote>(
        this.endpoint,
        { ideaId, voteType }
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Remove a vote
   */
  static async removeVote(ideaId: string): Promise<void> {
    try {
      await ApiClient.getInstance().delete(
        `${this.endpoint}/idea/${ideaId}`
      );
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }
}

export default VotesService;
