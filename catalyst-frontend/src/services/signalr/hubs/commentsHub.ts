import { connectionManager } from "../connectionManager";
import type { Comment } from "../../../types";

const HUB_NAME = "CommentsHub";
const HUB_PATH = "comments";

export class CommentsHub {
  async connect(token?: string): Promise<void> {
    await connectionManager.connect(HUB_NAME, HUB_PATH, token);
  }

  async disconnect(): Promise<void> {
    await connectionManager.disconnect(HUB_NAME);
  }

  isConnected(): boolean {
    return connectionManager.isConnected(HUB_NAME);
  }

  // Listen for new comments
  onCommentAdded(callback: (comment: Comment) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnCommentAdded", callback);
    }
  }

  // Listen for comment updates
  onCommentUpdated(callback: (comment: Comment) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnCommentUpdated", callback);
    }
  }

  // Listen for comment deletions
  onCommentDeleted(callback: (commentId: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnCommentDeleted", callback);
    }
  }

  // Stop listening for events
  offCommentAdded(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnCommentAdded");
    }
  }

  offCommentUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnCommentUpdated");
    }
  }

  offCommentDeleted(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnCommentDeleted");
    }
  }
}

export const commentsHub = new CommentsHub();
