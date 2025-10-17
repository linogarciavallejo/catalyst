import { connectionManager } from "../connectionManager";

const HUB_NAME = "VotesHub";
const HUB_PATH = "votes";

export class VotesHub {
  async connect(token?: string): Promise<void> {
    await connectionManager.connect(HUB_NAME, HUB_PATH, token);
  }

  async disconnect(): Promise<void> {
    await connectionManager.disconnect(HUB_NAME);
  }

  isConnected(): boolean {
    return connectionManager.isConnected(HUB_NAME);
  }

  // Listen for vote updates from other users
  onVoteUpdated(
    callback: (ideaId: string, upvotes: number, downvotes: number) => void
  ): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnVoteUpdated", callback);
    }
  }

  // Listen for vote removals
  onVoteRemoved(callback: (ideaId: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("OnVoteRemoved", callback);
    }
  }

  // Stop listening for events
  offVoteUpdated(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnVoteUpdated");
    }
  }

  offVoteRemoved(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("OnVoteRemoved");
    }
  }
}

export const votesHub = new VotesHub();
