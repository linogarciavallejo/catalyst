import React, { createContext } from "react";
import type { User } from "../types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    displayName: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  const [user, setUser] = React.useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [token, setToken] = React.useState<string | null>(storedToken);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const login = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Will be implemented with actual API call
      console.log("Login:", email, password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = React.useCallback(
    async (
      email: string,
      displayName: string,
      password: string,
      confirmPassword: string
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        // Will be implemented with actual API call
        console.log("Register:", email, displayName, password, confirmPassword);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = React.useCallback(async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
