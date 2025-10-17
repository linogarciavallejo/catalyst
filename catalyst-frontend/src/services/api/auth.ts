import { apiClient } from "./client";
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "../../types";

export const authService = {
  // Login user
  async login(request: LoginRequest): Promise<AuthResponse> {
    return apiClient.post("/auth/login", request as unknown as Record<string, unknown>);
  },

  // Register new user
  async register(request: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post("/auth/register", request as unknown as Record<string, unknown>);
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    return apiClient.get("/auth/profile");
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put("/auth/profile", data as unknown as Record<string, unknown>);
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout", {} as Record<string, unknown>);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post("/auth/refresh", {} as Record<string, unknown>);
  },
};
