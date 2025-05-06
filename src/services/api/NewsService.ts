import api from '@/services/api/AxiosInstance';
import type { News, CreateNewsDto } from '@/models/News';
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
  size: number = 3
): Promise<Page<News>> {
  try {
    const response = await api.get(`/public/news/${crisisEventId}`, {
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
export async function fetchGeneralNews(): Promise<News[]> {
  try {
    const response = await api.get('/public/news/general');
    return response.data.content || response.data;
  } catch (error: unknown) {
    console.error('Error fetching general news:', error);
    return [];
  }
}

/**
 * Fetches paginated news articles that are relevant to the user's location.
 * This includes news from crisis events within 100km of the user's registered addresses.
 *
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} Paginated response containing news articles
 */
export async function fetchNewsDigest(
  page: number = 0,
  size: number = 10
): Promise<Page<News>> {
  try {
    console.log(`Fetching news digest page ${page} with size ${size}`);
    const response = await api.get('/user/news/digest', {
      params: {
        page: page,  // Explicitly use the passed page parameter
        size: size   // Explicitly use the passed size parameter
      }
    });

    console.log(`Received page ${response.data.number} of ${response.data.totalPages} pages`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching news digest:', error);
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
 * Creates a paginated version of the fetchNewsByCrisisEvent function with a specific page size.
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
  return fetchNewsByCrisisEvent(crisisEventId, page, size);
}

/**
 * Creates a paginated version of the fetchGeneralNews function.
 * This converts the array response into a paginated format.
 *
 * @param {number} crisisId - Ignored parameter (for API compatibility)
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} Paginated response containing news articles
 */
export async function fetchPaginatedGeneralNews(
  crisisId: number,
  page: number = 0,
  size: number = 3
): Promise<Page<News>> {
  try {
    // Fetch all general news
    const allNews = await fetchGeneralNews();

    // Create paginated response
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
    console.error('Error fetching paginated general news:', error);
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
 * Creates a new news article. 
 * @param newsArticle 
 */
export async function adminAddNews(newsArticle: CreateNewsDto) {
  try {
    const response = await api.post('/admin/news', newsArticle);
    return response.data;
  } catch (error) {
    console.error('Error sending the news article to backend', error);
  }
}


// Export convenience functions with specific page sizes
export const fetchGeneralNewsSmall = (crisisId: number, page: number = 0) =>
  fetchPaginatedGeneralNews(crisisId, page, 2);

export const fetchGeneralNewsLarge = (crisisId: number, page: number = 0) =>
  fetchPaginatedGeneralNews(crisisId, page, 5);

// Export convenience functions with specific page sizes
export const fetchNewsDigestSmall = (page: number = 0) =>
  fetchNewsDigest(page, 5);

export const fetchNewsDigestLarge = (page: number = 0) =>
  fetchNewsDigest(page, 15);
