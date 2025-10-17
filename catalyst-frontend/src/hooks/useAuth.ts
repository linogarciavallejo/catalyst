import { useState, useCallback, useEffect } from "react";
import { authService } from "../services/api/auth";
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "../types";

export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authService.login(request);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authService.register(request);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    clearError,
  };
};
