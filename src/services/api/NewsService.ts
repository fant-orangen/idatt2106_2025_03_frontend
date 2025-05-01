import api from '@/services/api/AxiosInstance';
import type { News } from '@/models/News';
import type { Page } from '@/types/Page';

/**
 * NewsService class for handling all news-related API calls
 * Provides methods for fetching news with pagination and creating paginated wrappers
 */
export class NewsService {
  private static serviceCache = new Map<string, any>();

  /**
   * Fetches paginated news articles related to a specific crisis event.
   *
   * @param {number} crisisEventId - The ID of the crisis event
   * @param {number} page - The page number to fetch (0-based index)
   * @param {number} size - The number of items per page
   * @returns {Promise<Page<News>>} Paginated response containing news articles
   */
  static async fetchNewsByCrisisEvent(
    crisisEventId: number,
    page: number = 0,
    size: number = 3
  ): Promise<Page<News>> {
    try {
      const response = await api.get(`/news/${crisisEventId}`, {
        params: {
          page,
          size
        }
      });

      console.log(`News API response data for crisis ${crisisEventId}, page ${page}, size ${size}:`, response.data);

      // If the API returns a Page object directly, we can just return it
      if (response.data.content && response.data.totalPages !== undefined) {
        return response.data;
      }

      // Otherwise, we need to simulate pagination on the client side
      const allNews = response.data.content || response.data || [];
      const totalItems = allNews.length;
      const totalPages = Math.ceil(totalItems / size);
      const startIndex = page * size;
      const endIndex = Math.min(startIndex + size, totalItems);
      const paginatedContent = allNews.slice(startIndex, endIndex);

      console.log(`Paginated data: page=${page}, size=${size}, totalItems=${totalItems}, totalPages=${totalPages}`);
      console.log(`Returning items ${startIndex} to ${endIndex-1} (${paginatedContent.length} items)`);

      return {
        content: paginatedContent,
        totalElements: totalItems,
        totalPages: totalPages,
        size: size,
        number: page
      };
    } catch (error: unknown) {
      console.error(`Error fetching news for crisis event ${crisisEventId}:`, error);

      // Return empty page result instead of throwing error to prevent component crashes
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page
      };
    }
  }

  /**
   * Fetches general news articles (not related to a specific crisis).
   *
   * @returns {Promise<News[]>} Array of general news articles
   */
  static async fetchGeneralNews(): Promise<News[]> {
    try {
      // In a real application, this would call a different API endpoint
      const response = await api.get('/news/general');
      return response.data.content || response.data;
    } catch (error: unknown) {
      console.error('Error fetching general news:', error);
    }
  }

  /**
   * Creates a paginated wrapper for any news fetching function.
   * This allows client-side pagination for APIs that don't support server-side pagination.
   *
   * @param fetchFunction - The function that fetches news data
   * @param defaultSize - The default number of items per page (default: 3)
   * @param cacheKey - Optional key to cache results (default: generated from function name)
   * @returns A function that returns paginated news data
   */
  static createPaginatedService<T extends any[]>(
    fetchFunction: (id: number) => Promise<T>,
    defaultSize: number = 3,
    cacheKey?: string
  ) {
    // Generate a cache key if not provided
    const key = cacheKey || `paginated_${fetchFunction.name}_${defaultSize}`;

    // Check if we already have a cached service
    if (this.serviceCache.has(key)) {
      return this.serviceCache.get(key);
    }

    // Store the full dataset to avoid refetching
    let cachedData: T | null = null;
    let lastCrisisId: number | null = null;

    /**
     * Fetches paginated news using the provided fetch function
     *
     * @param crisisId - The ID of the crisis event
     * @param page - The page number to fetch (0-based index)
     * @param size - The number of items per page (overrides default)
     * @returns Paginated response
     */
    const paginatedFunction = async function(
      crisisId: number,
      page: number = 0,
      size: number = defaultSize
    ): Promise<Page<T[number]>> {
      try {
        // Check if we need to fetch new data
        const needsFetch = !cachedData || lastCrisisId !== crisisId;

        // Fetch data if needed
        if (needsFetch) {
          console.log(`Fetching fresh data for crisis ${crisisId}`);
          const response = await fetchFunction(crisisId);
          cachedData = response;
          lastCrisisId = crisisId;
        } else {
          console.log(`Using cached data for crisis ${crisisId}`);
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

        console.log(`Client-side pagination: page=${page}, size=${size}, totalItems=${totalItems}, totalPages=${totalPages}`);
        console.log(`Returning items ${startIndex} to ${endIndex-1} (${paginatedContent.length} items)`);

        return {
          content: paginatedContent,
          totalElements: totalItems,
          totalPages: totalPages,
          size: size,
          number: page
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
        console.error(`Error fetching paginated data for crisis ${crisisId}:`, error);

        // Return empty page result instead of throwing error
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: size,
          number: page
        };
      }
    };

    // Cache the service
    this.serviceCache.set(key, paginatedFunction);

    return paginatedFunction;
  }

  /**
   * Gets a paginated version of the crisis news service
   * @param size Default page size (default: 3)
   * @returns Paginated news service function
   */
  static getPaginatedCrisisNews(size: number = 3) {
    return this.createPaginatedService(
      this.fetchNewsByCrisisEvent,
      size,
      `crisis_news_${size}`
    );
  }

  /**
   * Gets a paginated version of the general news service
   * @param size Default page size (default: 3)
   * @returns Paginated news service function
   */
  static getPaginatedGeneralNews(size: number = 3) {
    return this.createPaginatedService(
      // Wrapper function to adapt parameter order
      async (crisisId: number) => this.fetchGeneralNews(),
      size,
      `general_news_${size}`
    );
  }
}

// Create default paginated services for convenience
export const fetchNewsByCrisisEvent = NewsService.fetchNewsByCrisisEvent;
export const fetchGeneralNews = NewsService.fetchGeneralNews;
export const paginatedCrisisNews = NewsService.getPaginatedCrisisNews();
export const paginatedGeneralNews = NewsService.getPaginatedGeneralNews();
