import { NewsService } from './NewsService';

/**
 * This file re-exports the general news functionality from the NewsService
 * for backward compatibility and to provide a clear separation of concerns.
 */

// Re-export the general news functions
export const fetchGeneralNews = NewsService.fetchGeneralNews;

// Create a paginated version of the general news service with a custom page size
export const paginatedGeneralNews = NewsService.getPaginatedGeneralNews(2);

// Example of creating a custom news service with a different page size
export const paginatedGeneralNewsLarge = NewsService.getPaginatedGeneralNews(5);
