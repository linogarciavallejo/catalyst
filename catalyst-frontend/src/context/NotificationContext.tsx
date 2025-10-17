import React, { createContext, useState, useCallback } from "react";
import { type Notification } from "../types";

export interface NotificationContextType {
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Toast messages (temporary notifications)
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning", duration?: number) => void;
  removeToast: (id: string) => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationContextProviderProps {
  children: React.ReactNode;
}

export const NotificationContextProvider: React.FC<
  NotificationContextProviderProps
> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info",
      duration = 4000
    ) => {
      const id = `toast-${Date.now()}`;
      const toast: ToastMessage = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove toast after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    toasts,
    showToast,
    removeToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };
