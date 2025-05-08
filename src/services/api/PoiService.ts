import api from '@/services/api/AxiosInstance.ts';
import type { PoiData, PoiPreviewDto } from '@/models/PoiData.ts';

import type {Page} from "@/types/Page.ts";

export async function fetchPoiPreviews(page = 0, size = 10, sort = 'id,asc'): Promise<Page<PoiPreviewDto>> {
  const response = await api.get<Page<PoiPreviewDto>>('/public/poi/previews', {
    params: { page, size, sort }
  })
    console.log('poi list:', response.data)
  return response.data
}

/**
 * Fetches all public Points of Interest (POIs) from the backend.
 * Corresponds to the /api/poi/public endpoint.
 *
 * @returns {Promise<PoiData[]>} A promise that resolves to an array of POI data.
 * @throws {Error} If the API request fails.
 */
export async function fetchPublicPois(): Promise<PoiData[]> {
  try {
    // Make GET request to the backend endpoint defined in PoiController.java
    const response = await api.get<PoiData[]>('/public/poi/public');
    console.log("Fetched POIs:", response.data); // Log fetched data
    return response.data;
  } catch (error) {
    console.error('Failed to fetch public POIs:', error);
    throw error; // Re-throw to be handled by the component
  }
}

/**
 * Fetches a specific Point of Interest (POI) by its ID.
 * Corresponds to the /api/poi/{id} endpoint.
 *
 * @param {number} id - The ID of the POI to fetch.
 * @returns {Promise<PoiData | null>} A promise that resolves to the POI data or null if not found.
 * @throws {Error} If the API request fails.
 */
export async function fetchPoiById(id: number): Promise<PoiData | null> {
  try {
    const response = await api.get<PoiData>(`/public/poi/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch POI with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetches Points of Interest (POIs) by type ID.
 * Corresponds to the /api/poi/type/{id} endpoint.
 *
 * @param {number} typeId - The type ID of the POIs to fetch.
 * @returns {Promise<PoiData[]>} A promise that resolves to an array of POI data.
 * @throws {Error} If the API request fails.
 */
export async function fetchPoisByType(typeId: number): Promise<PoiData[]> {
  try {
    const response = await api.get<PoiData[]>(`/public/poi/type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch POIs with type ID ${typeId}:`, error);
    throw error;
  }
}

/**
 * Fetches Points of Interest (POIs) near a specific location.
 * Corresponds to the /api/poi/type/nearby endpoint.
 *
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @param {number} distance - The distance in meters.
 * @param {number} [typeId] - Optional type ID to filter POIs.
 * @returns {Promise<PoiData[]>} A promise that resolves to an array of POI data.
 * @throws {Error} If the API request fails.
 */
export async function fetchPoisNearby(
  latitude: number,
  longitude: number,
  distance: number,
  typeId?: number
): Promise<PoiData[]> {
  try {
    const params: Record<string, string | number> = {
      latitude,
      longitude,
      distance
    };

    if (typeId !== undefined) {
      params.id = typeId;
    }

    const response = await api.get<PoiData[]>('/public/poi/type/nearby', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch nearby POIs:', error);
    throw error;
  }
}

/**
 * Fetches the nearest Point of Interest (POI) of a specific type from a given location.
 * Corresponds to the /api/poi/type/nearest/{id} endpoint.
 *
 * @param {number} typeId - The ID of the point of interest type.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<PoiData | null>} A promise that resolves to the nearest POI data or null if not found.
 * @throws {Error} If the API request fails.
 */
export async function fetchNearestPoiByType(
  typeId: number,
  latitude: number,
  longitude: number
): Promise<PoiData | null> {
  try {
    const params: Record<string, string | number> = {
      latitude,
      longitude
    };

    const response = await api.get<PoiData>(`/public/poi/type/nearest/${typeId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch nearest POI of type ${typeId}:`, error);
    throw error;
  }
}

/**
 * Fetches all POI types from the backend.
 * Corresponds to the /api/public/poi/types endpoint.
 *
 * @returns {Promise<{ id: number; name: string }[]>}
 */
export async function fetchPoiTypes(): Promise<{ id: number; name: string }[]> {
  try {
    const response = await api.get<{ id: number; name: string }[]>('/public/poi/types');
    console.log('Fetched POI types:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch POI types:', error);
    throw error;
  }
}

/**
  * Search POI previews by name (server‐side, paged).
  * Hits GET /api/public/poi/search?q={query}&page={page}&size={size}&sort={sort}
  */
  export async function searchPoiPreviews(
  query: string,
    page = 0,
    size = 10,
    sort = 'id,desc'
    ): Promise<Page<PoiPreviewDto>> {
  const response = await api.get<Page<PoiPreviewDto>>('/public/poi/search', {
      params: { q: query, page, size, sort }
  });
  console.log('poi search results:', response.data);
  return response.data;
}
