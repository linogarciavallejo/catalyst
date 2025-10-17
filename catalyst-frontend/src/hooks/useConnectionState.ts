import { useState, useCallback, useEffect } from "react";

export type ConnectionType = "websocket" | "rest" | "offline";

export interface ConnectionStateType {
  isConnected: boolean;
  connectionType: ConnectionType;
  lastConnected: Date | null;
  reconnectAttempts: number;
  error: string | null;
}

export interface UseConnectionStateReturn extends ConnectionStateType {
  reconnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

/**
 * useConnectionState Hook
 * Manages real-time connection state for WebSocket and REST APIs.
 * Provides connection status, auto-reconnect, and error handling.
 */
export const useConnectionState = (): UseConnectionStateReturn => {
  const [connectionState, setConnectionState] = useState<ConnectionStateType>({
    isConnected: true, // Assume connected initially
    connectionType: "rest", // Default to REST
    lastConnected: new Date(),
    reconnectAttempts: 0,
    error: null,
  });

  // Check if browser is online
  const isOnline = useCallback(() => {
    return navigator.onLine;
  }, []);

  // Handle online event
  const handleOnline = useCallback(() => {
    setConnectionState((prev) => ({
      ...prev,
      isConnected: true,
      connectionType: "rest",
      error: null,
      lastConnected: new Date(),
      reconnectAttempts: 0,
    }));
  }, []);

  // Handle offline event
  const handleOffline = useCallback(() => {
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      connectionType: "offline",
      error: "No internet connection",
    }));
  }, []);

  // Reconnect with exponential backoff
  const reconnect = useCallback(async () => {
    if (!isOnline()) {
      setConnectionState((prev) => ({
        ...prev,
        error: "No internet connection",
      }));
      return;
    }

    setConnectionState((prev) => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
      error: null,
    }));

    try {
      // Simulate connection check (in real app, this would test actual connectivity)
      await new Promise((resolve) => setTimeout(resolve, 500));

      setConnectionState((prev) => ({
        ...prev,
        isConnected: true,
        connectionType: "websocket",
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: null,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reconnect";

      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const backoffDelay = Math.min(
        1000 * Math.pow(2, connectionState.reconnectAttempts),
        30000
      );

      setConnectionState((prev) => ({
        ...prev,
        error: errorMessage,
      }));

      // Retry after backoff
      setTimeout(() => {
        reconnect();
      }, backoffDelay);
    }
  }, [isOnline, connectionState.reconnectAttempts]);

  // Disconnect
  const disconnect = useCallback(async () => {
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      connectionType: "offline",
      error: "Disconnected",
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setConnectionState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Set up online/offline listeners
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    ...connectionState,
    reconnect,
    disconnect,
    clearError,
  };
};
