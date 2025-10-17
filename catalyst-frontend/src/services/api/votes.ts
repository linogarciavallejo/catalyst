import { apiClient } from "./client";
import type { Vote, CreateVoteRequest, ApiResponse } from "../../types";

export const votesService = {
  // Get votes for an idea
  async getVotes(ideaId: string): Promise<Vote[]> {
    return apiClient.get(`/votes?ideaId=${ideaId}`);
  },

  // Get user's vote on an idea
  async getUserVote(ideaId: string): Promise<Vote | null> {
    try {
      return await apiClient.get(`/votes/${ideaId}/user`);
    } catch {
      return null;
    }
  },

  // Submit a vote
  async submitVote(request: CreateVoteRequest): Promise<Vote> {
    return apiClient.post("/votes", request as unknown as Record<string, unknown>);
  },

  // Remove a vote
  async removeVote(voteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/votes/${voteId}`);
  },

  // Remove user's vote on an idea
  async removeVoteByIdea(ideaId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/votes/idea/${ideaId}`);
  },
};
