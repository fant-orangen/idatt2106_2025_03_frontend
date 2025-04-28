/**
 * Interface representing a notification message received from the WebSocket.
 *
 * @interface Notification
 */
export interface Notification {
  id: number;
  userId: number;
  preferenceType: 'expiration_reminder' | 'crisis_alert' | 'location_request';
  targetType: 'inventory' | 'event' | 'location_request';
  targetId?: number;
  description?: string;
  notifyAt: Date;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

/**
 * Type for the notification handler function.
 *
 * @type NotificationHandler
 */
export type NotificationHandler = (notification: Notification) => void;


export interface CreateNotificationDto {
  userId: number;
  preferenceType: Notification['preferenceType'];
  targetType: Notification['targetType'];
  targetId?: number;
  description?: string;
  notifyAt: Date;
}
