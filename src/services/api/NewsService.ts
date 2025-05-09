import api from '@/services/api/AxiosInstance';
import type { News, CreateNewsDto, UpdateNewsArticleDTO } from '@/models/News';
import type { Page } from '@/types/Page';
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
    // Updated endpoint to match backend API
    const response = await api.get(`/public/news/crisis/${crisisEventId}`, {
      params: { page, size }
    });
    return response.data;
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
 * Fetches paginated general news articles (not related to a specific crisis).
 *
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} Paginated response containing news articles
 */
export async function fetchGeneralNews(
  page: number = 0,
  size: number = 10
): Promise<Page<News>> {
  try {
    console.log("on my way to fetch General News");
    const response = await api.get('/public/news/latest', {
      params: { page, size }
    });
    console.log("fetching general news:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching general news:', error);
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
 * Fetches paginated news articles that are relevant to the user's location.
 * This includes news from crisis events within 100km of the user's registered addresses.
 *
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} Paginated response containing news articles
 */
export async function getNewsDigest(
  page: number = 0,
  size: number = 10
): Promise<Page<News>> {
  try {
    const response = await api.get('/user/news/digest', {
      params: { page, size }
    });
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
 * Creates a new news article. Only accessible to admin or superadmin users.
 * @param newsArticle - CreateNewsDto object with all data variables to save.
 */
export async function adminAddNews(newsArticle: CreateNewsDto) {
  try {
    const response = await api.post('/admin/news', newsArticle);
    return response.data;
  } catch (error) {
    console.error('Error sending the news article to backend', error);
  }
}

/**
 * Update a news article, draft or not, with status or content. 
 * @param id - id of the specific news article to update
 * @param updatedData - new updated data to send to the backend API.
 */
export async function adminUpdateNews(id: number, updatedData: UpdateNewsArticleDTO) {
  try {
    const response = await api.patch('admin/news/' + id, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error while updating a news article')
  }
}

/**
 * Fetches the saved data of an existing news article. 
 * @param id - identifying the specified news article
 */
export async function fetchNewsArticleById(id: number) {
  try {
    const response = await api.get('public/news/article/' + id);
    return response.data;
  } catch (error) {
    console.error('Error while trying to fetch a news article')
  }
}

/**
 * Fetches news article drafts created by a user. 
 * @param userId - identifying the user by ID
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} - A paginated list of drafts created by the user
 */
export async function fetchDrafts(page: number, size: number): Promise<Page<News>> {
  try {
    const response = await api.get<Page<News>>('public/news/drafts', {
      params: {page, size}
    });
    return response.data;
  } catch (error) {
    console.error('Error while trying to fetch a news article')
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
 * Fetches published articles in order from latest to oldest.
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<News>>} - Paginated list of News objects
 */
export async function fetchLatestNews(page: number, size: number): Promise<Page<News>> {
  try {
    const response = await api.get<Page<News>>('/public/news/latest', {
      params:{page, size}
    })
    return response.data;
  } catch (error) {
    console.error('Failed to fetch the lates news from backend')
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
 * Convenience functions with specific page sizes that match the parameter order expected by NewsOverview
 * These functions take (crisisId, page, size) but only use page and a fixed size
 */
export const fetchGeneralNewsSmall = (crisisId: number | null, page: number = 0, size: number = 2) =>
  fetchGeneralNews(page, size);

export const fetchGeneralNewsLarge = (crisisId: number | null, page: number = 0, size: number = 5) =>
  fetchGeneralNews(page, size);

// Export convenience functions with specific page sizes
export const fetchNewsDigestSmall = (page: number = 0) =>
  getNewsDigest(page, 5);

export const fetchNewsDigestLarge = (page: number = 0) =>
  getNewsDigest(page, 15);
