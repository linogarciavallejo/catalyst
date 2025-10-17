import { useContext } from "react";
import { NotificationContext, type NotificationContextType } from "../context/NotificationContext";

/**
 * Hook to use NotificationContext
 * Must be used within NotificationContextProvider
 * @returns NotificationContextType - Notification state and methods
 * @throws Error if used outside of NotificationContextProvider
 */
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationContextProvider"
    );
  }
  return context;
};
