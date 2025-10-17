import { connectionManager } from "../connectionManager";
import type { ChatMessage } from "../../../types";

const HUB_NAME = "ChatHub";
const HUB_PATH = "chat";

export class ChatHub {
  async connect(token?: string): Promise<void> {
    await connectionManager.connect(HUB_NAME, HUB_PATH, token);
  }

  async disconnect(): Promise<void> {
    await connectionManager.disconnect(HUB_NAME);
  }

  isConnected(): boolean {
    return connectionManager.isConnected(HUB_NAME);
  }

  // Send message to chat room
  async sendMessage(room: string, content: string): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      await conn.invoke("SendMessage", room, content);
    }
  }

  // Join chat room
  async joinRoom(room: string): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      await conn.invoke("JoinRoom", room);
    }
  }

  // Leave chat room
  async leaveRoom(room: string): Promise<void> {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      await conn.invoke("LeaveRoom", room);
    }
  }

  // Listen for messages
  onMessageReceived(callback: (message: ChatMessage) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("ReceiveMessage", callback);
    }
  }

  // Listen for user joined
  onUserJoined(callback: (userId: string, userName: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("UserJoined", callback);
    }
  }

  // Listen for user left
  onUserLeft(callback: (userId: string, userName: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("UserLeft", callback);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback: (userId: string, userName: string) => void): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.on("UserTyping", callback);
    }
  }

  // Stop listening
  offMessageReceived(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("ReceiveMessage");
    }
  }

  offUserJoined(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("UserJoined");
    }
  }

  offUserLeft(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("UserLeft");
    }
  }

  offUserTyping(): void {
    const conn = connectionManager.getConnection(HUB_NAME);
    if (conn) {
      conn.off("UserTyping");
    }
  }
}

export const chatHub = new ChatHub();
export default chatHub;
