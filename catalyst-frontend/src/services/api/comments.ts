import { apiClient } from "./client";
import type { Comment, CreateCommentRequest, ApiResponse } from "../../types";

export const commentsService = {
  // Get comments for an idea
  async getComments(ideaId: string): Promise<Comment[]> {
    return apiClient.get(`/ideas/${ideaId}/comments`);
  },

  // Get single comment
  async getCommentById(id: string): Promise<Comment> {
    return apiClient.get(`/comments/${id}`);
  },

  // Add comment to idea
  async addComment(request: CreateCommentRequest): Promise<Comment> {
    return apiClient.post(
      `/ideas/${request.ideaId}/comments`,
      { content: request.content } as Record<string, unknown>
    );
  },

  // Update comment
  async updateComment(id: string, content: string): Promise<Comment> {
    return apiClient.put(`/comments/${id}`, { content } as Record<string, unknown>);
  },

  // Delete comment
  async deleteComment(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/comments/${id}`);
  },

  // Get comment count for idea
  async getCommentCount(ideaId: string): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      `/ideas/${ideaId}/comments/count`
    );
    return response.count;
  },
};
