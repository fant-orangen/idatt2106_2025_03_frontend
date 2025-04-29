/**
 * News service module.
 *
 * This service provides methods for news-related operations including
 * fetching news items.
 *
 * @module NewsService
 */

import api from '@/services/api/AxiosInstance';
import type { News } from '@/models/News'

const baseUrl = '/news';

/**
 * Fetches all news items
 * @returns Array of news items
 */
export async function getNews(): Promise<News[]> {
  const response = await api.get(`${baseUrl}`);
  return response.data.map(mapDatesToObjects);
}

/**
 * Fetches news items by position
 * @param position The position to filter by
 * @returns Array of news items for the specified position
 */
export async function getNewsByPosition(position: string): Promise<News[]> {
  const response = await api.get(`${baseUrl}/position/${position}`);
  return response.data.map(mapDatesToObjects);
}

/**
 * Helper function to convert date strings to Date objects
 */
function mapDatesToObjects(news: Omit<News, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
}): News {
  return {
    ...news,
    createdAt: news.createdAt ? new Date(news.createdAt) : undefined,
    updatedAt: news.updatedAt ? new Date(news.updatedAt) : undefined
  };
}
