import { connectionManager } from "../connectionManager";
import type { Idea } from "../../../types";

const HUB_NAME = "IdeasHub";
const HUB_PATH = "ideas";

export class IdeasHub {
  async connect(token?: string): Promise<void> {
    await connectionManager.connect(HUB_NAME, HUB_PATH, token);
  }

  async disconnect(): Promise<void> {
    await connectionManager.disconnect(HUB_NAME);
  }

  isConnected(): boolean {
    return connectionManager.isConnected(HUB_NAME);
  }

  // Listen for new ideas
  onIdeaCreated(callback: (idea: Idea) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnIdeaCreated", callback);
    }
  }

  // Listen for idea updates
  onIdeaUpdated(callback: (idea: Idea) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnIdeaUpdated", callback);
    }
  }

  // Listen for idea deletions
  onIdeaDeleted(callback: (ideaId: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnIdeaDeleted", callback);
    }
  }

  // Listen for vote updates
  onVoteUpdated(
    callback: (ideaId: string, upvotes: number, downvotes: number) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnVoteUpdated", callback);
    }
  }

  // Listen for comment count updates
  onCommentCountUpdated(
    callback: (ideaId: string, commentCount: number) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnCommentCountUpdated", callback);
    }
  }

  // Listen for idea status updates
  onIdeaStatusUpdated(
    callback: (ideaId: string, status: string) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnIdeaStatusUpdated", callback);
    }
  }

  // Stop listening for events
  offIdeaCreated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnIdeaCreated");
    }
  }

  offIdeaUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnIdeaUpdated");
    }
  }

  offIdeaDeleted(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnIdeaDeleted");
    }
  }

  offVoteUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnVoteUpdated");
    }
  }

  offCommentCountUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnCommentCountUpdated");
    }
  }

  offIdeaStatusUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnIdeaStatusUpdated");
    }
  }
}

export const ideasHub = new IdeasHub();
export default ideasHub;
