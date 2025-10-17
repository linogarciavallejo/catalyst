import { useState, useCallback, useEffect } from "react";
import { ActivityHub, type UserActivity } from "../services/signalr/hubs/activityHub";

export interface UseActivityReturn {
  typingUsers: Record<string, string[]>; // ideaId -> userName[]
  viewingUsers: Record<string, string[]>; // ideaId -> userName[]
  activeUsers: UserActivity[];
  startTyping: (ideaId: string) => void;
  stopTyping: (ideaId: string) => void;
  setViewingIdea: (ideaId: string) => void;
  setIdle: () => void;
}

export const useActivity = (): UseActivityReturn => {
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [viewingUsers, setViewingUsers] = useState<Record<string, string[]>>({});
  const [activeUsers, setActiveUsers] = useState<UserActivity[]>([]);
  const [typingTimeouts, setTypingTimeouts] = useState<Record<string, ReturnType<typeof setTimeout>>>({});

  // Set up real-time listeners from SignalR
  useEffect(() => {
    const activityHub = new ActivityHub();
    
    // Connect to SignalR hub
    activityHub.connect().catch((err) => {
      console.error("Failed to connect to ActivityHub:", err);
    });

    // Listen for users typing
    activityHub.onUserTyping((userId: string, userName: string, ideaId: string) => {
      setTypingUsers((prev) => {
        const users = prev[ideaId] || [];
        // Avoid duplicates
        if (users.includes(userName)) return prev;
        return {
          ...prev,
          [ideaId]: [...users, userName],
        };
      });

      // Auto-remove after 5 seconds if no new typing event
      const key = `${ideaId}-${userId}`;
      if (typingTimeouts[key]) {
        clearTimeout(typingTimeouts[key]);
      }
      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const users = prev[ideaId] || [];
          return {
            ...prev,
            [ideaId]: users.filter((u) => u !== userName),
          };
        });
      }, 5000);
      
      setTypingTimeouts((prev) => ({
        ...prev,
        [key]: timeout,
      }));
    });

    // Listen for users stopped typing
    activityHub.onUserStoppedTyping((userId: string, ideaId: string) => {
      const key = `${ideaId}-${userId}`;
      if (typingTimeouts[key]) {
        clearTimeout(typingTimeouts[key]);
      }
    });

    // Listen for users viewing ideas
    activityHub.onUserViewing((_userId: string, userName: string, ideaId: string) => {
      setViewingUsers((prev) => {
        const users = prev[ideaId] || [];
        if (users.includes(userName)) return prev;
        return {
          ...prev,
          [ideaId]: [...users, userName],
        };
      });
    });

    // Listen for users idle
    activityHub.onUserIdle((userId: string) => {
      // Remove user from all viewing lists
      setViewingUsers((prev) => {
        const updated = { ...prev };
        for (const ideaId in updated) {
          updated[ideaId] = updated[ideaId].filter(
            (u) => u !== userId // In real implementation, compare IDs not names
          );
        }
        return updated;
      });
    });

    // Listen for active users list updates
    activityHub.onActiveUsersUpdated((users: UserActivity[]) => {
      setActiveUsers(users);
    });

    // Cleanup on unmount
    return () => {
      // Clear all typing timeouts
      for (const timeout of Object.values(typingTimeouts)) {
        clearTimeout(timeout);
      }
      
      activityHub.disconnect().catch((err) => {
        console.error("Failed to disconnect from ActivityHub:", err);
      });
    };
  }, [typingTimeouts]);

  const startTyping = useCallback((ideaId: string) => {
    const activityHub = new ActivityHub();
    activityHub.sendTypingActivity(ideaId, true).catch((err) => {
      console.error("Failed to send typing activity:", err);
    });
  }, []);

  const stopTyping = useCallback((ideaId: string) => {
    const activityHub = new ActivityHub();
    activityHub.sendTypingActivity(ideaId, false).catch((err) => {
      console.error("Failed to send stop typing activity:", err);
    });
  }, []);

  const setViewingIdea = useCallback((ideaId: string) => {
    const activityHub = new ActivityHub();
    activityHub.sendViewingActivity(ideaId).catch((err) => {
      console.error("Failed to send viewing activity:", err);
    });
  }, []);

  const setIdle = useCallback(() => {
    const activityHub = new ActivityHub();
    activityHub.sendIdleActivity().catch((err) => {
      console.error("Failed to send idle activity:", err);
    });
  }, []);

  return {
    typingUsers,
    viewingUsers,
    activeUsers,
    startTyping,
    stopTyping,
    setViewingIdea,
    setIdle,
  };
};
