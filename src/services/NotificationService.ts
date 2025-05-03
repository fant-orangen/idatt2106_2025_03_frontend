/**
 * Notification service module.
 *
 * This service provides methods for notification-related operations including
 * creating and getting.
 *
 * @module NotificationService
 */

import api from '@/services/api/AxiosInstance';
import type { NotificationMessage } from '@/models/NotificationMessage.ts'
import type { Page } from '@/types/Page';

/**
 * Fetches notifications for a specific user
 * @param page The page number (default: 1)
 * @param size The number of items per page (default: 20)
 * @returns Page of notifications
 */
export async function getNotifications(page: number = 1, size: number = 20): Promise<Page<NotificationMessage>> {
  const response = await api.get(`/notifications?page=${page - 1}&size=${size}`);
  console.log(response.data);
  return {
    ...response.data,
    content: response.data.content.map(mapDatesToObjects)
  };
}

function mapDatesToObjects(notification: NotificationMessage): NotificationMessage {
  return {
    ...notification,
    notifyAt: new Date(notification.notifyAt),
    sentAt: notification.sentAt ? new Date(notification.sentAt) : undefined,
    readAt: notification.readAt ? new Date(notification.readAt) : undefined,
    createdAt: new Date(notification.createdAt)
  };
}
