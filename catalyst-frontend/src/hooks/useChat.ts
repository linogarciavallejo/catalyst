import { useState, useCallback, useRef } from "react";
import { ChatService, AuthService } from "../services";
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

      await ChatService.connect(user.id, token);
      setIsConnected(true);

      // Define and store callbacks
      const onMessageReceived = (data: unknown) => {
        setMessages((prev) => [...prev, data as ChatMessage]);
      };
      
      const onConnected = () => {
        setIsConnected(true);
      };
      
      const onDisconnected = () => {
        setIsConnected(false);
      };

      // Store callbacks for cleanup
      callbacksRef.current.set('messageReceived', onMessageReceived);
      callbacksRef.current.set('connected', onConnected);
      callbacksRef.current.set('disconnected', onDisconnected);

      // Listen for events
      ChatService.on('messageReceived', onMessageReceived);
      ChatService.on('connected', onConnected);
      ChatService.on('disconnected', onDisconnected);
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
      // Unregister stored callbacks
      const onMessageReceived = callbacksRef.current.get('messageReceived');
      const onConnected = callbacksRef.current.get('connected');
      const onDisconnected = callbacksRef.current.get('disconnected');

      if (onMessageReceived) ChatService.off('messageReceived', onMessageReceived);
      if (onConnected) ChatService.off('connected', onConnected);
      if (onDisconnected) ChatService.off('disconnected', onDisconnected);

      callbacksRef.current.clear();
      
      await ChatService.disconnect();
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
      await ChatService.sendMessage(room, content);
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
      await ChatService.joinRoom(room);
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
      await ChatService.leaveRoom(room);
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
