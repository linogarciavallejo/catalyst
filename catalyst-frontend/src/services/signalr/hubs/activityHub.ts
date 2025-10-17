import { connectionManager } from "../connectionManager";
import * as signalR from "@microsoft/signalr";

const HUB_NAME = "ActivityHub";
const HUB_PATH = "activity";

export interface UserActivity {
  userId: string;
  userName: string;
  activityType: "typing" | "viewing" | "idle";
  ideaId?: string;
  timestamp: Date;
}

export class ActivityHub {
  async connect(token?: string): Promise<void> {
    await connectionManager.connect(HUB_NAME, HUB_PATH, token);
  }

  async disconnect(): Promise<void> {
    await connectionManager.disconnect(HUB_NAME);
  }

  isConnected(): boolean {
    return connectionManager.isConnected(HUB_NAME);
  }

  // Broadcast typing activity
  async sendTypingActivity(ideaId: string, isTyping: boolean): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke("SendTypingActivity", ideaId, isTyping);
      } catch (error) {
        console.error("Failed to send typing activity:", error);
      }
    }
  }

  // Broadcast viewing activity
  async sendViewingActivity(ideaId: string): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke("SendViewingActivity", ideaId);
      } catch (error) {
        console.error("Failed to send viewing activity:", error);
      }
    }
  }

  // Broadcast idle activity
  async sendIdleActivity(): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke("SendIdleActivity");
      } catch (error) {
        console.error("Failed to send idle activity:", error);
      }
    }
  }

  // Listen for user typing
  onUserTyping(
    callback: (userId: string, userName: string, ideaId: string) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnUserTyping", callback);
    }
  }

  // Listen for user stopped typing
  onUserStoppedTyping(callback: (userId: string, ideaId: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnUserStoppedTyping", callback);
    }
  }

  // Listen for user viewing idea
  onUserViewing(
    callback: (userId: string, userName: string, ideaId: string) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnUserViewing", callback);
    }
  }

  // Listen for user idle
  onUserIdle(callback: (userId: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnUserIdle", callback);
    }
  }

  // Listen for active users list
  onActiveUsersUpdated(
    callback: (users: UserActivity[]) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnActiveUsersUpdated", callback);
    }
  }

  // Stop listening for events
  offUserTyping(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnUserTyping");
    }
  }

  offUserStoppedTyping(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnUserStoppedTyping");
    }
  }

  offUserViewing(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnUserViewing");
    }
  }

  offUserIdle(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnUserIdle");
    }
  }

  offActiveUsersUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnActiveUsersUpdated");
    }
  }
}

export const activityHub = new ActivityHub();
