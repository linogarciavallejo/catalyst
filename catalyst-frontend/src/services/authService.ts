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

// Actual response from backend
export interface BackendAuthResponse {
  accessToken: string;
  oid?: string;
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
      console.log("[AUTH-SERVICE] Login request:", request);
      const response = await ApiClient.getInstance().post<BackendAuthResponse>(
        `${this.endpoint}/login`,
        request
      );

      console.log("[AUTH-SERVICE] Full response object:", response);
      console.log("[AUTH-SERVICE] response.data:", response.data);
      console.log("[AUTH-SERVICE] response.data (JSON):", JSON.stringify(response.data, null, 2));

      const backendResponse = response.data;
      
      // Transform backend response to AuthResponse format
      // Backend returns { accessToken, ...otherFields }
      // We need { token, user }
      const transformedResponse: AuthResponse = {
        token: backendResponse.accessToken || '',
        user: {
          id: backendResponse.oid || '',
          email: request.email,
          displayName: request.email.split('@')[0], // Extract from email
          role: 'Contributor',
          eipPoints: 0,
          createdAt: new Date(),
        },
      };

      console.log("[AUTH-SERVICE] Transformed response:", transformedResponse);

      // Store the token
      if (transformedResponse.token) {
        ApiClient.setAuthToken(transformedResponse.token);
      }

      return transformedResponse;
    } catch (error) {
      console.error("[AUTH-SERVICE] Login error:", error);
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Register a new user
   */
  static async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log("[AUTH-SERVICE] Register request:", request);
      const response = await ApiClient.getInstance().post<BackendAuthResponse>(
        `${this.endpoint}/register`,
        request
      );

      console.log("[AUTH-SERVICE] Register response structure:", {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        fullResponse: response.data,
      });

      const backendResponse = response.data;
      
      // Transform backend response to AuthResponse format
      const transformedResponse: AuthResponse = {
        token: backendResponse.accessToken || '',
        user: {
          id: backendResponse.oid || '',
          email: request.email,
          displayName: request.displayName,
          role: 'Contributor',
          eipPoints: 0,
          createdAt: new Date(),
        },
      };

      console.log("[AUTH-SERVICE] Transformed register response:", transformedResponse);

      // Store the token
      if (transformedResponse.token) {
        ApiClient.setAuthToken(transformedResponse.token);
      }

      return transformedResponse;
    } catch (error) {
      console.error("[AUTH-SERVICE] Register error:", error);
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
