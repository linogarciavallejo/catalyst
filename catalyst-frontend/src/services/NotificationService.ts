/**
 * Centralized Notification Service
 * Abstraction layer for notifications/toasts
 * Currently uses Ant Design, but can be swapped to react-toastify if needed
 *
 * This service provides a unified interface so we can test both solutions
 * and easily switch between them without changing consuming code.
 */

import { message, notification, Modal } from 'antd';

/**
 * Initialize notification instances (should be called in App.tsx)
 */
export const initNotifications = () => {
  // Ant Design uses static methods, so we don't need to initialize
  return { initialized: true };
};

/**
 * Centralized Notification Service with unified interface
 */
export const NotificationService = {
  /**
   * Simple success message (auto-dismiss)
   */
  success: (content: string, duration: number = 3) => {
    message.success({ content, duration });
  },

  /**
   * Error message with optional description
   */
  error: (content: string, description?: string, duration: number = 5) => {
    if (description) {
      notification.error({ message: content, description, duration });
    } else {
      message.error({ content, duration });
    }
  },

  /**
   * Warning message
   */
  warning: (content: string, description?: string, duration: number = 4) => {
    if (description) {
      notification.warning({ message: content, description, duration });
    } else {
      message.warning({ content, duration });
    }
  },

  /**
   * Info message
   */
  info: (content: string, description?: string, duration: number = 3) => {
    if (description) {
      notification.info({ message: content, description, duration });
    } else {
      message.info({ content, duration });
    }
  },

  /**
   * Loading message - returns a function to dismiss
   */
  loading: (content: string) => {
    const hideKey = `loading_${Date.now()}`;
    message.loading({ content, key: hideKey, duration: 0 });
    // Return dismiss function
    return () => {
      message.destroy(hideKey);
    };
  },

/**
 * Confirmation modal
 */
  confirm: (
    title: string,
    content: string,
    onOk: () => void,
    onCancel?: () => void
  ) => {
    Modal.confirm({
      title,
      content,
      onOk() {
        onOk();
      },
      onCancel() {
        onCancel?.();
      },
      okText: 'Confirm',
      cancelText: 'Cancel',
    });
  },

  /**
   * Persistent important notification (user must dismiss)
   */
  persistent: (
    title: string,
    description: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    notification[type]({
      message: title,
      description,
      duration: 0, // Don't auto-dismiss
      placement: 'topRight',
    });
  },
};

export default NotificationService;
