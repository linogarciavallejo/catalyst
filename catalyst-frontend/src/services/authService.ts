import { ApiClient, ApiErrorHandler } from './api';
import type { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Authentication API Service
 * Handles login, registration, and auth-related operations
 */
export class AuthService {
  private static readonly endpoint = '/auth';

  /**
   * Login with email and password
   */
  static async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await ApiClient.getInstance().post<AuthResponse>(
        `${this.endpoint}/login`,
        request
      );

      // Store the token
      if (response.data.token) {
        ApiClient.setAuthToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Register a new user
   */
  static async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await ApiClient.getInstance().post<AuthResponse>(
        `${this.endpoint}/register`,
        request
      );

      // Store the token
      if (response.data.token) {
        ApiClient.setAuthToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await ApiClient.getInstance().post(`${this.endpoint}/logout`);
      ApiClient.clearAuthToken();
    } catch (error) {
      // Always clear token even if logout fails
      ApiClient.clearAuthToken();
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await ApiClient.getInstance().get<User>(
        `${this.endpoint}/me`
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Refresh auth token
   */
  static async refreshToken(): Promise<string> {
    try {
      const response = await ApiClient.getInstance().post<{ token: string }>(
        `${this.endpoint}/refresh`
      );

      if (response.data.token) {
        ApiClient.setAuthToken(response.data.token);
      }

      return response.data.token;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!ApiClient.getAuthToken();
  }

  /**
   * Get stored auth token
   */
  static getToken(): string | null {
    return ApiClient.getAuthToken();
  }
}

export default AuthService;
