import * as SignalR from '@microsoft/signalr';
import { SIGNALR_URL } from './api';

export type ChatEventCallback = (data?: unknown) => void;

/**
 * Chat Service using SignalR for real-time messaging
 */
export class ChatService {
  private static connection: SignalR.HubConnection | null = null;
  private static listeners: Map<string, ChatEventCallback[]> = new Map();

  /**
   * Initialize chat connection
   */
  static async connect(userId: string, token: string): Promise<void> {
    if (this.connection?.state === SignalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new SignalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_URL}/hubs/chat`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 0, 1000, 2000, 5000, 10000])
      .withHubProtocol(new SignalR.JsonHubProtocol())
      .build();

    // Setup event listeners
    this.connection.on('ReceiveMessage', (message) => {
      this.emit('messageReceived', message);
    });

    this.connection.on('UserJoined', (user) => {
      this.emit('userJoined', user);
    });

    this.connection.on('UserLeft', (userId) => {
      this.emit('userLeft', userId);
    });

    this.connection.onreconnecting(() => {
      this.emit('connecting');
    });

    this.connection.onreconnected(() => {
      this.emit('reconnected');
    });

    this.connection.onclose(() => {
      this.emit('disconnected');
    });

    try {
      await this.connection.start();
      await this.connection.invoke('JoinChat', userId);
      this.emit('connected');
    } catch (error) {
      console.error('Chat connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from chat
   */
  static async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error disconnecting from chat:', error);
      }
      this.connection = null;
    }
  }

  /**
   * Join a chat room
   */
  static async joinRoom(roomName: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chat not connected');
    }

    try {
      await this.connection.invoke('JoinRoom', roomName);
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  /**
   * Leave a chat room
   */
  static async leaveRoom(roomName: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chat not connected');
    }

    try {
      await this.connection.invoke('LeaveRoom', roomName);
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(roomName: string, message: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chat not connected');
    }

    try {
      await this.connection.invoke('SendMessage', roomName, message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get connection state
   */
  static isConnected(): boolean {
    return this.connection?.state === SignalR.HubConnectionState.Connected;
  }

  /**
   * Register event listener
   */
  static on(event: string, callback: ChatEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unregister event listener
   */
  static off(event: string, callback: ChatEventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private static emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export default ChatService;
