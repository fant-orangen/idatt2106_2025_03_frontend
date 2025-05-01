import api from '@/services/api/AxiosInstance';
import type { News } from '@/models/News';
import { createPaginatedNewsService } from './PaginatedNewsService';

/**
 * Fetches general news articles (not related to a specific crisis).
 * This is an example of a different news source.
 *
 * @returns {Promise<News[]>} Array of general news articles
 */
export async function fetchGeneralNews(): Promise<News[]> {
  try {
    // In a real application, this would call a different API endpoint
    const response = await api.get('/news/general');
    return response.data.content || response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch general news';
    console.error('Error fetching general news:', error);
    
    // For demo purposes, return mock data if the API fails
    console.log('Returning mock general news data');
    return [
      {
        id: 101,
        title: 'New Emergency Preparedness Guidelines Released',
        content: 'The government has released new guidelines for emergency preparedness that all citizens should follow.',
        publishedAt: new Date().toISOString(),
        createdByUserId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 102,
        title: 'Weather Warning System Upgraded',
        content: 'The national weather service has upgraded its warning system to provide more accurate and timely alerts.',
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        createdByUserId: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 103,
        title: 'Emergency Response Teams Receive New Equipment',
        content: 'Local emergency response teams have received new equipment to better handle crisis situations.',
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        createdByUserId: 1,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 104,
        title: 'Community Disaster Drill Scheduled',
        content: 'A community-wide disaster drill is scheduled for next month to test emergency response procedures.',
        publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        createdByUserId: 1,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: 105,
        title: 'New Emergency Shelter Locations Announced',
        content: 'The city has announced new emergency shelter locations that will be available during crisis events.',
        publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        createdByUserId: 1,
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date(Date.now() - 345600000).toISOString()
      }
    ];
  }
}

// Create a paginated version of the general news service with 2 items per page
export const paginatedGeneralNews = createPaginatedNewsService(fetchGeneralNews, 2);
