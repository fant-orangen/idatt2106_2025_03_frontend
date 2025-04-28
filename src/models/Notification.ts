/**
 * Interface representing a notification message received from the WebSocket.
 *
 * @interface NotificationMessage
 */
export interface NotificationMessage {
  id: number;
  userId: number;
  preferenceType: string;
  targetType: string;
  targetId?: number;
  description?: string;
  notifyAt: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

/**
 * Type for the notification handler function.
 *
 * @type NotificationHandler
 */
export type NotificationHandler = (notification: NotificationMessage) => void;
