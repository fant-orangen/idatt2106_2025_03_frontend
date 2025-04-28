/**
 * Notification service module.
 *
 * This service provides methods for notification-related operations including
 * creating and getting.
 *
 * @module NotificationService
 */

import api from '@/services/api/AxiosInstance';
import type { Notification } from '@/models/Notification'

const baseUrl = '/notifications';

/**
 * Fetches notifications for a specific user
 * @param userId The user ID
 * @returns Array of notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get(`${baseUrl}`);
  return response.data.map(mapDatesToObjects);
}


function mapDatesToObjects(notification: any): Notification {
  return {
    ...notification,
    notifyAt: notification.notifyAt ? new Date(notification.notifyAt) : undefined,
    sentAt: notification.sentAt ? new Date(notification.sentAt) : undefined,
    readAt: notification.readAt ? new Date(notification.readAt) : undefined,
    createdAt: new Date(notification.createdAt)
  };
}
