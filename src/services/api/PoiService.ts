import api from '@/services/api/AxiosInstance.ts';
import type { PoiData } from '@/models/PoiData.ts';

import axios from 'axios';

const API_BASE = '/api/poi';

export async function getPoiById(id: number) {
  const response = await axios.get(`${API_BASE}/${id}`, {
    withCredentials: true // viktig for å sende cookie/session info
  });
  return response.data;
}

export async function getAllPoiTypes() {
  const response = await axios.get(`${API_BASE}/types`, {
    withCredentials: true
  });
  return response.data;
}

export async function updatePoi(id: number, data: any) {
  await axios.put(`${API_BASE}/${id}`, data, {
    withCredentials: true // kreves for å sende innlogget bruker (admin)
  });
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
