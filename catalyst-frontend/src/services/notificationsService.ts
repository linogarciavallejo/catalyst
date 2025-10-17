import * as SignalR from '@microsoft/signalr';
import { SIGNALR_URL } from './api';
import { ApiClient, ApiErrorHandler } from './api';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'activity';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}

export type NotificationEventCallback = (notification?: unknown) => void;

/**
 * Notifications Service using SignalR for real-time notifications
 */
export class NotificationsService {
  private static connection: SignalR.HubConnection | null = null;
  private static listeners: Map<string, NotificationEventCallback[]> =
    new Map();

  /**
   * Initialize notifications connection
   */
  static async connect(_userId: string, token: string): Promise<void> {
    if (
      this.connection?.state === SignalR.HubConnectionState.Connected
    ) {
      return;
    }

    this.connection = new SignalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 0, 1000, 2000, 5000, 10000])
      .withHubProtocol(new SignalR.JsonHubProtocol())
      .build();

    // Setup event listeners
    this.connection.on('NotificationReceived', (notification: Notification) => {
      this.emit('notificationReceived', notification);
    });

    this.connection.on('NotificationRead', (notificationId: string) => {
      this.emit('notificationRead', notificationId);
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
      this.emit('connected');
    } catch (error) {
      console.error('Notifications connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from notifications
   */
  static async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error disconnecting from notifications:', error);
      }
      this.connection = null;
    }
  }

  /**
   * Get all notifications for current user
   */
  static async getNotifications(): Promise<Notification[]> {
    try {
      const response = await ApiClient.getInstance().get<Notification[]>(
        '/notifications'
      );
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await ApiClient.getInstance().get<{ count: number }>(
        '/notifications/unread/count'
      );
      return response.data.count;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await ApiClient.getInstance().put(
        `/notifications/${notificationId}/read`
      );
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    try {
      await ApiClient.getInstance().put('/notifications/read-all');
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await ApiClient.getInstance().delete(`/notifications/${notificationId}`);
    } catch (error) {
      throw ApiErrorHandler.handle(error);
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
  static on(event: string, callback: NotificationEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unregister event listener
   */
  static off(event: string, callback: NotificationEventCallback): void {
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

export default NotificationsService;
