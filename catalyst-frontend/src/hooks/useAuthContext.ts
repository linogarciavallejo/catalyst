import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../context/AuthContext";

/**
 * Hook to use AuthContext
 * Must be used within AuthProvider
 * @returns AuthContextType - Authentication state and methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
