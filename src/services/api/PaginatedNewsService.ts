import api from '@/services/api/AxiosInstance';
import type { News } from '@/models/News';
import type { Page } from '@/types/Page';

/**
 * Creates a paginated wrapper for any news fetching function.
 * This allows client-side pagination for APIs that don't support server-side pagination.
 *
 * @param fetchFunction - The function that fetches news data
 * @param pageSize - The number of items per page (default: 3)
 * @returns A function that returns paginated news data
 */
export function createPaginatedNewsService<T extends any[]>(
  fetchFunction: (...args: any[]) => Promise<T>,
  pageSize: number = 3
) {
  // Store the full dataset to avoid refetching
  let cachedData: T | null = null;
  let lastArgs: any[] | null = null;
  
  /**
   * Fetches paginated news using the provided fetch function
   * 
   * @param page - The page number to fetch (0-based index)
   * @param size - The number of items per page (overrides default)
   * @param args - Arguments to pass to the fetch function
   * @returns Paginated response
   */
  return async function fetchPaginated(
    page: number = 0,
    size: number = pageSize,
    ...args: any[]
  ): Promise<Page<T[number]>> {
    try {
      // Check if we need to fetch new data
      const needsFetch = !cachedData || 
        !lastArgs || 
        JSON.stringify(lastArgs) !== JSON.stringify(args);
      
      // Fetch data if needed
      if (needsFetch) {
        const response = await fetchFunction(...args);
        cachedData = response;
        lastArgs = args;
      }
      
      if (!cachedData) {
        throw new Error('Failed to fetch data');
      }
      
      // If the data is already a Page object, return it
      if (
        typeof cachedData === 'object' && 
        cachedData !== null && 
        'content' in cachedData && 
        'totalPages' in cachedData
      ) {
        return cachedData as unknown as Page<T[number]>;
      }
      
      // Otherwise, create a paginated response
      const totalItems = cachedData.length;
      const totalPages = Math.ceil(totalItems / size);
      const startIndex = page * size;
      const endIndex = Math.min(startIndex + size, totalItems);
      const paginatedContent = cachedData.slice(startIndex, endIndex);
      
      return {
        content: paginatedContent,
        totalElements: totalItems,
        totalPages: totalPages,
        size: size,
        number: page
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      console.error(`Error fetching paginated data:`, error);
      throw new Error(errorMessage);
    }
  };
}

/**
 * Fetches paginated news articles related to a specific crisis event.
 *
 * @param {number} crisisEventId - The ID of the crisis event
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} Paginated response containing news articles
 */
export async function fetchPaginatedNewsByCrisisEvent(
  crisisEventId: number,
  page: number = 0,
  size: number = 3
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

// Import the original news service
import { fetchNewsByCrisisEvent } from '@/services/api/NewsService';

// Create a paginated version of the crisis news service with 3 items per page
export const paginatedCrisisNews = createPaginatedNewsService(fetchNewsByCrisisEvent, 3);
