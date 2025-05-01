import api from '@/services/api/AxiosInstance';
import type { News } from '@/models/News';
import type { Page } from '@/types/Page';

/**
 * Fetches paginated news articles related to a specific crisis event.
 *
 * @param {number} crisisEventId - The ID of the crisis event
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} Paginated response containing news articles
 */
export async function fetchNewsByCrisisEvent(
  crisisEventId: number,
  page: number = 0,
  size: number = 2
): Promise<Page<News>> {
  try {
    // The actual API might not support pagination, so we're simulating it here
    const response = await api.get(`/news/${crisisEventId}`);
    console.log("News API response data:", response.data);

    // If the API returns a Page object directly, we can just return it
    if (response.data.content && response.data.totalPages !== undefined) {
      return response.data;
    }

    // Otherwise, we need to simulate pagination on the client side
    const allNews = response.data.content || response.data;
    const totalItems = allNews.length;
    const totalPages = Math.ceil(totalItems / size);
    const startIndex = page * size;
    const endIndex = Math.min(startIndex + size, totalItems);
    const paginatedContent = allNews.slice(startIndex, endIndex);

    return {
      content: paginatedContent,
      totalElements: totalItems,
      totalPages: totalPages,
      size: size,
      number: page
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
    console.error(`Error fetching news for crisis event ${crisisEventId}:`, error);
    throw new Error(errorMessage);
  }
}
