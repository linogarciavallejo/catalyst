import { useState, useCallback, useRef } from "react";
import { chatHub } from "../services/signalr/hubs/chatHub";
import type { ChatMessage } from "../types";

export interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  activeUsers: string[];
  typingUsers: Set<string>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (room: string, content: string) => Promise<void>;
  joinRoom: (room: string) => Promise<void>;
  leaveRoom: (room: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await chatHub.connect();
      setIsConnected(true);

      // Listen for message received
      chatHub.onMessageReceived((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      });

      // Listen for user joined
      chatHub.onUserJoined((_userId: string, userName: string) => {
        setActiveUsers((prev) => [...new Set([...prev, userName])]);
      });

      // Listen for user left
      chatHub.onUserLeft((_userId: string, userName: string) => {
        setActiveUsers((prev) => prev.filter((u) => u !== userName));
      });

      // Listen for typing indicator
      chatHub.onUserTyping((userId: string) => {
        setTypingUsers((prev) => new Set([...prev, userId]));

        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current[userId]) {
          clearTimeout(typingTimeoutRef.current[userId]);
        }

        typingTimeoutRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const updated = new Set(prev);
            updated.delete(userId);
            return updated;
          });
          delete typingTimeoutRef.current[userId];
        }, 3000);
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to chat";
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      chatHub.offMessageReceived();
      chatHub.offUserJoined();
      chatHub.offUserLeft();
      chatHub.offUserTyping();
      await chatHub.disconnect();
      setIsConnected(false);
      setMessages([]);
      setActiveUsers([]);
      setTypingUsers(new Set());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to disconnect from chat";
      setError(errorMessage);
    }
  }, []);

  const sendMessage = useCallback(async (room: string, content: string) => {
    setError(null);

    try {
      await chatHub.sendMessage(room, content);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const joinRoom = useCallback(async (room: string) => {
    setError(null);

    try {
      await chatHub.joinRoom(room);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to join room";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const leaveRoom = useCallback(async (room: string) => {
    setError(null);

    try {
      await chatHub.leaveRoom(room);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to leave room";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    activeUsers,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    clearMessages,
    clearError,
  };
};
