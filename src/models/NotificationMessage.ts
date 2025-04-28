/**
 * Interface representing a notification message received from the WebSocket.
 *
 * @interface NotificationMessage
 */
export interface NotificationMessage {
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
export type NotificationHandler = (notification: NotificationMessage) => void;


export interface CreateNotificationDto {
  userId: number;
  preferenceType: NotificationMessage['preferenceType'];
  targetType: NotificationMessage['targetType'];
  targetId?: number;
  description?: string;
  notifyAt: Date;
}
