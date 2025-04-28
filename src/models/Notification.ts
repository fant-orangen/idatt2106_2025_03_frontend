/**
 * Interface representing a notification message received from the WebSocket.
 *
 * @interface NotificationMessage
 */
export interface NotificationMessage {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
}

/**
 * Type for the notification handler function.
 *
 * @type NotificationHandler
 */
export type NotificationHandler = (notification: NotificationMessage) => void;
