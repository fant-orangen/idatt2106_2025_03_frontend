import api from '@/services/api/AxiosInstance';
import type { News } from '@/models/News';

/**
 * Fetches news articles related to a specific crisis event.
 *
 * @param {number} crisisEventId - The ID of the crisis event
 * @returns {Promise<News[]>} Array of news articles related to the crisis event
 */
export async function fetchNewsByCrisisEvent(crisisEventId: number): Promise<News[]> {
  try {
    const response = await api.get(`/news/${crisisEventId}`);
    console.log("News API response data:", response.data);

    return response.data.content
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
    console.error(`Error fetching news for crisis event ${crisisEventId}:`, error);
    throw new Error(errorMessage);
  }
}
