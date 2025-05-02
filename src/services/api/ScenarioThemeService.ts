import api from '@/services/api/AxiosInstance';
import type { ScenarioThemeDto, ScenarioThemeDetailsDto } from '@/models/ScenarioTheme';
import type { Page } from '@/types/Page';

/**
 * Fetches all scenario themes with pagination.
 *
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<ScenarioThemeDto>>} Paginated response containing scenario themes
 */
export async function fetchAllScenarioThemes(
  page: number = 0,
  size: number = 10
): Promise<Page<ScenarioThemeDto>> {
  try {
    const response = await api.get('/scenario-themes/all', {
      params: {
        page,
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching scenario themes:', error);
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
 * Fetches a specific scenario theme by its ID.
 *
 * @param {number} id - The ID of the scenario theme to fetch
 * @returns {Promise<ScenarioThemeDetailsDto | null>} The scenario theme details or null if not found
 */
export async function fetchScenarioThemeById(id: number): Promise<ScenarioThemeDetailsDto | null> {
  try {
    const response = await api.get(`/scenario-themes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching scenario theme with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetches active scenario themes (non-paginated).
 * This is useful for dropdowns and other UI elements that need all active themes.
 *
 * @returns {Promise<ScenarioThemeDto[]>} Array of active scenario themes
 */
export async function fetchActiveScenarioThemes(): Promise<ScenarioThemeDto[]> {
  try {
    // This endpoint would need to be added to the backend
    const response = await api.get('/scenario-themes/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active scenario themes:', error);
    return [];
  }
}
