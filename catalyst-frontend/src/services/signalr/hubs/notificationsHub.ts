import { connectionManager } from "../connectionManager";
import type { Notification } from "../../../types";

const HUB_NAME = "NotificationsHub";
const HUB_PATH = "notifications";

export class NotificationsHub {
  async connect(token?: string): Promise<void> {
    await connectionManager.connect(HUB_NAME, HUB_PATH, token);
  }

  async disconnect(): Promise<void> {
    await connectionManager.disconnect(HUB_NAME);
  }

  isConnected(): boolean {
    return connectionManager.isConnected(HUB_NAME);
  }

  // Listen for notifications
  onNotificationReceived(callback: (notification: Notification) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("ReceiveNotification", callback);
    }
  }

  // Listen for idea voted notification
  onIdeaVoted(
    callback: (ideaId: string, userId: string, voteType: string) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnIdeaVoted", callback);
    }
  }

  // Listen for idea commented notification
  onIdeaCommented(
    callback: (ideaId: string, commenterId: string, comment: string) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnIdeaCommented", callback);
    }
  }

  // Listen for idea updated notification
  onIdeaUpdated(callback: (ideaId: string, status: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnIdeaUpdated", callback);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      await conn.invoke("MarkAsRead", notificationId);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      await conn.invoke("MarkAllAsRead");
    }
  }

  // Stop listening
  offNotificationReceived(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("ReceiveNotification");
    }
  }

  offIdeaVoted(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnIdeaVoted");
    }
  }

  offIdeaCommented(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnIdeaCommented");
    }
  }

  offIdeaUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnIdeaUpdated");
    }
  }
}

export const notificationsHub = new NotificationsHub();
export default notificationsHub;
