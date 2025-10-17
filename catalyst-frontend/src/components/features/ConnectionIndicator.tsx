import React from 'react';
import { useConnectionState } from '@/hooks/useConnectionState';

/**
 * ConnectionIndicator Component
 * Shows real-time connection status to user.
 * Displays: Connected, Reconnecting, or Offline states.
 */
const ConnectionIndicator: React.FC = () => {
  const {
    isConnected,
    connectionType,
    reconnectAttempts,
    error,
    reconnect,
  } = useConnectionState();

  // Don't show indicator when connected
  if (isConnected && !error) {
    return null;
  }

  // Determine status text and color
  const getStatusInfo = () => {
    if (connectionType === 'offline') {
      return {
        text: 'Offline',
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500',
        icon: '⚠️',
      };
    }

    if (reconnectAttempts > 0 && !isConnected) {
      return {
        text: `Reconnecting... (Attempt ${reconnectAttempts})`,
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-700',
        dotColor: 'bg-yellow-500',
        icon: '🔄',
      };
    }

    if (error) {
      return {
        text: error,
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500',
        icon: '❌',
      };
    }

    return {
      text: 'Connected',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      dotColor: 'bg-green-500',
      icon: '✓',
    };
  };

  const status = getStatusInfo();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${status.bgColor} ${status.textColor}`}
    >
      {/* Status indicator dot */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status.dotColor}`} />
        <span>{status.icon}</span>
      </div>

      {/* Status text */}
      <span>{status.text}</span>

      {/* Reconnect button when disconnected */}
      {!isConnected && connectionType === 'offline' && (
        <button
          onClick={() => reconnect()}
          className="ml-2 px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      )}

      {/* Auto-reconnecting indicator */}
      {!isConnected && reconnectAttempts > 0 && (
        <div className="ml-auto">
          <div className="animate-spin inline-block w-3 h-3 border-2 border-yellow-500 border-t-yellow-200 rounded-full" />
        </div>
      )}
    </div>
  );
};

ConnectionIndicator.displayName = 'ConnectionIndicator';

export default ConnectionIndicator;
