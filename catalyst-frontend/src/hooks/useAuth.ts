import { useState, useCallback } from "react";
import { AuthService } from "../services";
import type { User, LoginRequest, RegisterRequest } from "../types";

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

// Initialize auth from localStorage synchronously
const getInitialAuthState = (): { user: User | null; token: string | null } => {
  try {
    console.log("[AUTH] getInitialAuthState called - checking localStorage");
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    console.log("[AUTH] storedUser:", storedUser ? "exists" : "null");
    console.log("[AUTH] storedToken:", storedToken ? "exists" : "null");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      console.log("[AUTH] ✅ Found authenticated user:", parsedUser.displayName || parsedUser.email);
      return {
        user: parsedUser,
        token: storedToken,
      };
    }
    console.log("[AUTH] ❌ No stored auth data found");
  } catch (err) {
    console.error("[AUTH] Error loading from localStorage:", err);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  return { user: null, token: null };
};

export const useAuth = (): UseAuthReturn => {
  const initialState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [token, setToken] = useState<string | null>(initialState.token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("[AUTH] useAuth hook initialized - initial user:", initialState.user ? "exists" : "null");
  console.log("[AUTH] isAuthenticated:", !!(initialState.user && initialState.token));

  const login = useCallback(async (request: LoginRequest) => {
    console.log("[AUTH] Login attempt with email:", request.email);
    setIsLoading(true);
    setError(null);

    try {
      console.log("[AUTH] Calling AuthService.login...");
      const loginResponse = await AuthService.login(request);
      console.log("[AUTH] ✅ Login successful, user:", loginResponse.user.displayName || loginResponse.user.email);
      setUser(loginResponse.user);
      setToken(loginResponse.token);
      localStorage.setItem("user", JSON.stringify(loginResponse.user));
      localStorage.setItem("token", loginResponse.token);
      console.log("[AUTH] ✅ Auth state saved to localStorage");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";
      console.error("[AUTH] ❌ Login failed:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    console.log("[AUTH] Register attempt with email:", request.email);
    setIsLoading(true);
    setError(null);

    try {
      console.log("[AUTH] Calling AuthService.register...");
      const registerResponse = await AuthService.register(request);
      console.log("[AUTH] ✅ Registration successful, user:", registerResponse.user.displayName || registerResponse.user.email);
      setUser(registerResponse.user);
      setToken(registerResponse.token);
      localStorage.setItem("user", JSON.stringify(registerResponse.user));
      localStorage.setItem("token", registerResponse.token);
      console.log("[AUTH] ✅ Auth state saved to localStorage");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      console.error("[AUTH] ❌ Registration failed:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log("[AUTH] Logout called");
    try {
      // Try to notify backend, but don't block if it fails
      console.log("[AUTH] Calling AuthService.logout...");
      await AuthService.logout();
      console.log("[AUTH] ✅ Backend logout successful");
    } catch (err) {
      console.error("[AUTH] ❌ Backend logout error (continuing with local logout):", err);
      // Continue with local logout even if backend call fails
    } finally {
      // Always clear local state
      console.log("[AUTH] Clearing local auth state...");
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.log("[AUTH] ✅ Local auth state cleared, localStorage wiped");
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
