import { useState, useCallback } from "react";
import { notificationsHub } from "../services/signalr/hubs/notificationsHub";
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

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await notificationsHub.connect();
      setIsConnected(true);

      // Listen for notifications
      notificationsHub.onNotificationReceived((notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      // Listen for idea voted
      notificationsHub.onIdeaVoted((ideaId: string, userId: string, voteType: string) => {
        const message = `User ${userId} ${voteType}d your idea`;
        const notification: Notification = {
          id: `vote_${ideaId}_${userId}`,
          userId,
          message,
          type: "IdeaVoted",
          isRead: false,
          createdAt: new Date(),
        };
        setNotifications((prev) => [notification, ...prev]);
      });

      // Listen for idea commented
      notificationsHub.onIdeaCommented((ideaId: string, commenterId: string) => {
        const message = `User ${commenterId} commented on your idea`;
        const notification: Notification = {
          id: `comment_${ideaId}_${commenterId}`,
          userId: commenterId,
          message,
          type: "IdeaCommented",
          isRead: false,
          createdAt: new Date(),
        };
        setNotifications((prev) => [notification, ...prev]);
      });

      // Listen for idea updated
      notificationsHub.onIdeaUpdated((ideaId: string, status: string) => {
        const message = `Your idea status changed to ${status}`;
        const notification: Notification = {
          id: `status_${ideaId}`,
          userId: "",
          message,
          type: "IdeaUpdated",
          isRead: false,
          createdAt: new Date(),
        };
        setNotifications((prev) => [notification, ...prev]);
      });
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
      notificationsHub.offNotificationReceived();
      notificationsHub.offIdeaVoted();
      notificationsHub.offIdeaCommented();
      notificationsHub.offIdeaUpdated();
      await notificationsHub.disconnect();
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
      await notificationsHub.markNotificationAsRead(notificationId);
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
      await notificationsHub.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark all as read";
      setError(errorMessage);
      throw err;
    }
  }, []);

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
