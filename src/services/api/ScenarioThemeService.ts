/**
 * Service for handling scenario themes.
 * Provides functions to fetch, create, update, and delete scenario themes.
 */

import api from '@/services/api/AxiosInstance';
import type { ScenarioThemeDto, ScenarioThemeDetailsDto, CreateScenarioThemeDto, UpdateScenarioThemeDto, ScenarioThemePreview } from '@/models/ScenarioTheme';
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
    const response = await api.get('/public/scenario-themes/all', {
      params: {
        page,
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching scenario themes:', error);

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
    const response = await api.get(`/public/scenario-themes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching scenario theme with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetches only the 'under' (during crisis) instructions for a specific scenario theme.
 *
 * @param {number} id - The ID of the scenario theme to fetch
 * @returns {Promise<string | null>} The 'under' instructions or null if not found
 */
export async function fetchScenarioThemeUnderInstructions(id: number): Promise<string | null> {
  try {
    const theme = await fetchScenarioThemeById(id);
    return theme?.under || null;
  } catch (error) {
    console.error(`Error fetching 'under' instructions for scenario theme with ID ${id}:`, error);
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
    const response = await api.get('/public/scenario-themes/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active scenario themes:', error);
    return [];
  }
}

/**
 * Creates a new scenario theme.
 *
 * @param {CreateScenarioThemeDto} themeData - The data for the new scenario theme
 * @returns {Promise<ScenarioThemeDto>} The created scenario theme
 */
export async function createScenarioTheme(themeData: CreateScenarioThemeDto): Promise<ScenarioThemeDto> {
  try {
    const response = await api.post('/admin/scenario-themes', themeData);
    return response.data;
  } catch (error) {
    console.error('Error creating scenario theme:', error);
    throw error;
  }
}

/**
 * Updates an existing scenario theme.
 *
 * @param {UpdateScenarioThemeDto} themeData - The data to update the scenario theme with
 * @returns {Promise<ScenarioThemeDto>} The updated scenario theme
 */
export async function updateScenarioTheme(themeData: UpdateScenarioThemeDto): Promise<ScenarioThemeDto> {
  try {
    const response = await api.patch(`/admin/scenario-themes`, themeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating scenario theme with ID ${themeData.id}:`, error);
    throw error;
  }
}

/**
 * Archives a scenario theme by setting its status to 'archived'.
 * This performs a soft delete rather than removing the theme from the database.
 *
 * @param {UpdateScenarioThemeDto} themeData - The theme data to be archived
 * @returns {Promise<ScenarioThemeDto>} The archived scenario theme
 */
export async function deleteScenarioTheme(themeData: UpdateScenarioThemeDto): Promise<ScenarioThemeDto> {
  try {
    const archiveData: UpdateScenarioThemeDto = {
      ...themeData,
      status: 'archived'
    }

    const response = await api.patch(`/admin/scenario-themes`, archiveData);
    return response.data;
  } catch (error) {
    console.error(`Error archiving scenario theme with ID ${themeData.id}:`, error);
    throw error;
  }
}

/**
 * Fetches a list of scenario theme previews.
 * Used when creating or editing an event when only the name and id of the scenario is needed.
 *
 * @returns {Promise<ScenarioThemeDto[]>} Paginated response containing preview of scenarios
 */
export async function getScenarioThemePreview(){
  try {
    const response = await api.get('/public/scenario-themes/previews/all');
    console.log('scenarios:', response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching scenario themes:', error);
  }
}