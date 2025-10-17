import { useState, useCallback, useRef } from "react";
import { NotificationsService, AuthService } from "../services";
import type { Notification } from "../types";

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store callbacks for cleanup
  const callbacksRef = useRef<Map<string, (data?: unknown) => void>>(new Map());

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await AuthService.getCurrentUser();
      const token = AuthService.getToken();
      
      if (!user || !token) {
        throw new Error("User not authenticated");
      }

      await NotificationsService.connect(user.id, token);
      setIsConnected(true);

      // Define and store callbacks
      const onNotificationReceived = (data: unknown) => {
        setNotifications((prev) => [data as Notification, ...prev]);
      };

      const onConnected = () => {
        setIsConnected(true);
      };

      const onDisconnected = () => {
        setIsConnected(false);
      };

      // Store callbacks for cleanup
      callbacksRef.current.set('notificationReceived', onNotificationReceived);
      callbacksRef.current.set('connected', onConnected);
      callbacksRef.current.set('disconnected', onDisconnected);

      // Listen for events
      NotificationsService.on('notificationReceived', onNotificationReceived);
      NotificationsService.on('connected', onConnected);
      NotificationsService.on('disconnected', onDisconnected);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to connect to notifications";
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      // Unregister stored callbacks
      const onNotificationReceived = callbacksRef.current.get('notificationReceived');
      const onConnected = callbacksRef.current.get('connected');
      const onDisconnected = callbacksRef.current.get('disconnected');

      if (onNotificationReceived) NotificationsService.off('notificationReceived', onNotificationReceived);
      if (onConnected) NotificationsService.off('connected', onConnected);
      if (onDisconnected) NotificationsService.off('disconnected', onDisconnected);

      callbacksRef.current.clear();
      
      await NotificationsService.disconnect();
      setIsConnected(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to disconnect from notifications";
      setError(errorMessage);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    setError(null);

    try {
      await NotificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark as read";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setError(null);

    try {
      // Mark each unread notification individually or call a batch API
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      await Promise.all(unreadIds.map((id) => NotificationsService.markAsRead(id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark all as read";
      setError(errorMessage);
      throw err;
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearError,
  };
};
