import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge, Spinner } from '@/components/ui';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'activity';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
  onDismiss?: () => void;
}

export interface NotificationPanelProps {
  notifications: Notification[];
  loading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onDismissAll?: () => void;
  onMarkAsRead?: (notificationId: string) => void;
  className?: string;
  maxVisible?: number;
}

const typeIconMap: Record<NotificationType, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  activity: '🔔',
};

/**
 * NotificationPanel Component
 * Displays a list of notifications with dismissal and action capabilities.
 * Features:
 * - Type-based icons and colors
 * - Read/unread status
 * - Relative timestamps
 * - Action buttons
 * - Dismissal functionality
 * - Mark as read capability
 * - Loading states
 * - Customizable max visible
 */
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  loading = false,
  onNotificationClick,
  onDismissAll,
  onMarkAsRead,
  className = '',
  maxVisible = 5,
}) => {
  const visibleNotifications = notifications.slice(0, maxVisible);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalHidden = Math.max(0, notifications.length - maxVisible);

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-4 ${className}`}>
        <Spinner size="sm" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={`text-center p-6 text-gray-500 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="warning" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        {notifications.length > 0 && onDismissAll && (
          <button
            onClick={onDismissAll}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
              notification.read
                ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                : 'bg-blue-50 border-blue-500 hover:bg-blue-100'
            }`}
            onClick={() => {
              if (!notification.read && onMarkAsRead) {
                onMarkAsRead(notification.id);
              }
              onNotificationClick?.(notification);
            }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-lg flex-shrink-0 mt-0.5">
                {typeIconMap[notification.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>

                {/* Action Button */}
                {notification.actionUrl && notification.actionLabel && (
                  <a
                    href={notification.actionUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {notification.actionLabel} →
                  </a>
                )}
              </div>

              {/* Unread Indicator */}
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show More */}
      {totalHidden > 0 && (
        <div className="text-center p-2">
          <p className="text-xs text-gray-500">
            {totalHidden} more notification{totalHidden !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
