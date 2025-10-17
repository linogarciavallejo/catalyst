import { useContext } from "react";
import { AppContext, type AppContextType } from "../context/AppContext";

/**
 * Hook to use AppContext
 * Must be used within AppContextProvider
 * @returns AppContextType - Global app state and methods
 * @throws Error if used outside of AppContextProvider
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
