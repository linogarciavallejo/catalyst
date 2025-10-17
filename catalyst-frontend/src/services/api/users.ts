import { apiClient } from "./client";
import type { User } from "../../types";

export const usersService = {
  // Get user by ID
  async getUserById(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`);
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User> {
    return apiClient.get(`/users/email/${encodeURIComponent(email)}`);
  },

  // Get all users (admin only)
  async getAllUsers(page: number = 1, pageSize: number = 20): Promise<{
    items: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return apiClient.get(
      `/users?page=${page}&pageSize=${pageSize}`
    );
  },

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    ideasCreated: number;
    votesGiven: number;
    commentsGiven: number;
    eipPoints: number;
  }> {
    return apiClient.get(`/users/${userId}/stats`);
  },

  // Get users leaderboard
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return apiClient.get(`/users/leaderboard?limit=${limit}`);
  },
};
