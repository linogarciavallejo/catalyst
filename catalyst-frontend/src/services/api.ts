import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5223/api';
const SIGNALR_URL = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5223';

// Error handling
export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

export class ApiErrorHandler {
  static handle(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Record<string, unknown>>;
      return {
        status: axiosError.response?.status || 500,
        message:
          (axiosError.response?.data as Record<string, unknown>)?.message as string ||
          axiosError.message ||
          'An error occurred',
        details: (axiosError.response?.data as Record<string, unknown>)?.details as string,
      };
    }

    if (error instanceof Error) {
      return {
        status: 500,
        message: error.message,
      };
    }

    return {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
}

// Base API Client
export class ApiClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Request interceptor for auth token
      ApiClient.instance.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor for error handling
      ApiClient.instance.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    }

    return ApiClient.instance;
  }

  static setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    ApiClient.getInstance().defaults.headers.common[
      'Authorization'
    ] = `Bearer ${token}`;
  }

  static clearAuthToken(): void {
    localStorage.removeItem('authToken');
    delete ApiClient.getInstance().defaults.headers.common['Authorization'];
  }

  static getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export { API_BASE_URL, SIGNALR_URL };
