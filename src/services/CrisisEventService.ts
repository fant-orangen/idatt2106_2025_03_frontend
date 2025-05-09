/**
 * Service for handling crisis events.
 * Provides functions to fetch, filter, and process crisis events from the backend API.
 * Includes mapping functions to convert between backend and frontend data models.
 */

import api from '@/services/api/AxiosInstance';
import type { CrisisEvent } from '@/types/map';
import type { Page } from '@/types/Page';
import type { BackendCrisisEvent} from '@/models/BackendCrisisEvent';
import type { CrisisEventDto, CrisisEventPreviewDto, CrisisEventChange } from '@/models/CrisisEvent.ts';


/**
 * API Service Functions for Crisis Events
 * These functions handle communication with the backend API
 */

/**
 * Fetches all crisis events from the backend API, returned as a Page object.
 * Includes both active and inactive events.
 *
 * @param pageable Optional pagination parameters (page, size).
 * @returns {Promise<Page<CrisisEvent>>} A Page of crisis events formatted for the frontend.
 */
export async function fetchAllCrisisEvents(pageable?: { page?: number; size?: number }): Promise<Page<CrisisEvent>> {
  try {
    const response = await api.get<Page<BackendCrisisEvent>>('/public/crisis-events/all', {
      params: pageable,
      headers: { 'Content-Type': 'application/json' },
    });

    const mappedContent = response.data.content
      .map(mapBackendToFrontendEvent)
      .filter(event => !isNaN(event.latitude) && !isNaN(event.longitude) && !isNaN(event.radius));


    return {
      ...response.data,
      content: mappedContent,
    };
  } catch (error) {
    console.error('Error fetching all crisis events:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: pageable?.size ?? 20,
      number: pageable?.page ?? 0,
      first: true,
      last: true,
      empty: true,
    };
  }
}

/**
 * Fetches only the *active* crisis events from the backend API.
 * Fetches all events and filters them client-side.
 *
 * @returns {Promise<CrisisEvent[]>} Array of active crisis events formatted for the frontend.
 */
export async function fetchActiveCrisisEvents(): Promise<CrisisEvent[]> {
  try {
    const allEventsPage = await fetchAllCrisisEvents({ size: 200 });
    const activeEvents = allEventsPage.content.filter(event => event.isActive);


    return activeEvents;

  } catch (error) {
    console.error('Error fetching active crisis events:', error);
    return [];
  }
}

/**
 * Fetches all crisis events from the backend API.
 * Makes a GET request to the '/crisis-events/all/previews' endpoint.
 * Note: This includes both active and inactive events.
 *
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<CrisisEventPreviewDto>>} Paginated response containing crisis event previews
 */
export async function fetchAllPreviewCrisisEvents(
  page = 0,
  size = 10
): Promise<Page<CrisisEventPreviewDto>> {
  try {
    const response = await api.get<Page<CrisisEventPreviewDto>>('/public/crisis-events/all/previews', {
      params: { page, size },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch paginated crisis events', error);
    throw error;
  }
}
/**
 * Fetches inactive crisis events from the backend API.
 * Makes a GET request to the '/crisis-events/inactive/previews' endpoint.
 * Note: This includes both active and inactive events.
 *
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<CrisisEventPreviewDto>>} Paginated response containing crisis event previews
 */
export async function fetchInactivePreviewCrisisEvents(
  page = 0,
  size = 10
): Promise<Page<CrisisEventPreviewDto>> {
  try {
    const response = await api.get<Page<CrisisEventPreviewDto>>('/public/crisis-events/inactive/previews', {
      params: { page, size },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch paginated crisis events', error);
    throw error;
  }
}

/**
 * Fetches crisis events within the radius of the current user's location.
 * Returns a paginated response with crisis events that are relevant to the user.
 *
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @returns {Promise<Page<CrisisEventPreviewDto>>} Paginated response containing crisis events
 */
export async function fetchCrisisEventsInRadius(
  page = 0,
  size = 5
): Promise<Page<CrisisEventPreviewDto>> {
  try {
    const response = await api.get<Page<CrisisEventPreviewDto>>('/user/crisis-events/all/current-user', {
      params: { page, size },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch paginated crisis events', error);
    throw error;
  }
}

/**
 * Fetches a single crisis event by ID.
 * Makes a GET request to the '/crisis-events/{id}' endpoint.
 *
 * @param {number} id - The ID of the crisis event to fetch
 * @returns {Promise<CrisisEventDto | null>} The crisis event or null if not found
 */
export async function fetchCrisisEventById(id: number): Promise<CrisisEventDto | null> {
  try {
    const response = await api.get<CrisisEventDto>(`/public/crisis-events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch crisis event ID ${id}:`, error);
    throw error;
  }
}

/**
 * Searches for crisis events by name.
 * Makes a GET request to the '/public/crisis-events/search' endpoint.
 *
 * @param {string} query - The search query string
 * @param {number} page - The page number to fetch (0-based index)
 * @param {number} size - The number of items per page
 * @param {boolean} isActive - Whether to search only active events (default: true)
 * @returns {Promise<Page<CrisisEventPreviewDto>>} Paginated response containing matching crisis events
 */
export async function searchCrisisEvents(
  query: string,
  page = 0,
  size = 10,
  isActive = true
): Promise<Page<CrisisEventPreviewDto>> {
  try {
    const response = await api.get<Page<CrisisEventPreviewDto>>('/public/crisis-events/search', {
      params: {
        nameSearch: query,
        isActive,
        page,
        size
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search crisis events', error);
    throw error;
  }
}

/**
 * Fetches paginated crisis event changes for a given crisis event ID.
 *
 * @param crisisEventId - The ID of the crisis event.
 * @param page - The page number to fetch (0-based index).
 * @param size - The number of items per page (default is 20).
 * @returns A paginated response containing crisis event changes.
 * @throws Error if the request fails.
 */
export async function fetchCrisisEventChanges(
  crisisEventId: number,
  page: number,
  size = 5
): Promise<Page<CrisisEventChange>> {
  try {
    const response = await api.get<Page<CrisisEventChange>>(
      `/public/crisis-events/${crisisEventId}/changes`,
      { params: { page, size } }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch changes for crisis ${crisisEventId}`, error);
    throw error;
  }
}

/**
 * Fetches crisis events associated with a specific scenario theme.
 *
 * @param {number} scenarioThemeId - The ID of the scenario theme
 * @returns {Promise<CrisisEventDto[]>} Array of crisis events related to the scenario theme
 */
export async function fetchCrisisEventsByScenarioTheme(scenarioThemeId: number): Promise<CrisisEventDto[]> {
  try {
    const response = await api.get<CrisisEventDto[]>(`/crisis-events/by-theme/${scenarioThemeId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch crisis events for scenario theme ${scenarioThemeId}:`, error);
    return [];
  }
}

/**
 * Converts a backend crisis event object to the frontend CrisisEvent format.
 * Maps field names and converts severity string to numeric level.
 * Includes basic validation for numeric types.
 *
 * @param backendEvent The crisis event data received from the backend.
 * @returns A CrisisEvent object suitable for the frontend.
 */
function mapBackendToFrontendEvent(backendEvent: BackendCrisisEvent): CrisisEvent {
  let level: 1 | 2 | 3;
  switch (backendEvent.severity) {
    case 'green': level = 1; break;
    case 'yellow': level = 2; break;
    case 'red': level = 3; break;
    default: level = 1;
  }

  /**
   * Safely parse numeric values from the backend event
   * Handles potential type inconsistencies in the API response
   */
  let latitude: number = NaN;
  let longitude: number = NaN;
  let radius: number = NaN;

  try {
    latitude = typeof backendEvent.epicenterLatitude === 'number'
      ? backendEvent.epicenterLatitude
      : parseFloat(backendEvent.epicenterLatitude as any);
  } catch (e) { console.error(`Error parsing latitude for event ${backendEvent.id}:`, e); }

  try {
    longitude = typeof backendEvent.epicenterLongitude === 'number'
      ? backendEvent.epicenterLongitude
      : parseFloat(backendEvent.epicenterLongitude as any);
  } catch (e) { console.error(`Error parsing longitude for event ${backendEvent.id}:`, e); }

  try {
    radius = typeof backendEvent.radius === 'number'
      ? backendEvent.radius
      : parseFloat(backendEvent.radius as any);
  } catch (e) { console.error(`Error parsing radius for event ${backendEvent.id}:`, e); }

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
    console.error(`Invalid numeric data after parsing for Crisis Event ID ${backendEvent.id}`, backendEvent);
  }

  return {
    id: backendEvent.id,
    name: backendEvent.name,
    description: backendEvent.description,
    latitude: latitude,
    longitude: longitude,
    level: level,
    radius: radius,
    startTime: backendEvent.startTime,
    isActive: backendEvent.active,
    createdBy: `User ${backendEvent.createdByUser?.id ?? 'Unknown'}`,
    createdAt: backendEvent.startTime,
    updatedAt: backendEvent.updatedAt,
  };
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * Consider moving this to a shared utility file (e.g., src/utils/locationUtils.ts).
 *
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in meters.
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

