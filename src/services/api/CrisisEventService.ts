import api from '@/services/api/AxiosInstance';
import type { CrisisEvent } from '@/types/map';

// Define an interface representing the Page structure from Spring Boot
interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page number (0-indexed)
  // Add other Page properties if needed (first, last, empty, etc.)
}

// Define an interface for the backend crisis event model
interface BackendCrisisEvent {
  id: number;
  name: string;
  description?: string;
  severity: string; // 'green', 'yellow', 'red'
  epicenterLatitude: number;
  epicenterLongitude: number;
  radius?: number;
  startTime: string;
  updatedAt: string;
  createdByUserId: number;
  active: boolean;
}

/**
 * Converts a backend crisis event to the frontend CrisisEvent format.
 * Maps field names and converts severity to numeric level.
 *
 * @param backendEvent The crisis event data from the backend
 * @returns A properly formatted CrisisEvent for the frontend
 */
function mapBackendToFrontendEvent(backendEvent: BackendCrisisEvent): CrisisEvent {
  // Convert severity string to numeric level
  let level = 1; // default level (green)
  if (backendEvent.severity === 'yellow') level = 2;
  if (backendEvent.severity === 'red') level = 3;

  return {
    id: backendEvent.id,
    name: backendEvent.name,
    description: backendEvent.description,
    latitude: backendEvent.epicenterLatitude,
    longitude: backendEvent.epicenterLongitude,
    level: level,
    startTime: backendEvent.startTime,
    isActive: backendEvent.active,
    createdBy: `User ${backendEvent.createdByUserId}`,
    createdAt: backendEvent.updatedAt,
    updatedAt: backendEvent.updatedAt
  };
}

/**
 * Fetches all crisis events from the backend API, returned as a Page object.
 * Makes a GET request to the '/crisis-events/all' endpoint.
 * Note: This might include inactive events depending on the backend implementation.
 *
 * @returns {Promise<Page<CrisisEvent>>} A Page of crisis events.
 */
export async function fetchAllCrisisEvents(): Promise<Page<CrisisEvent>> {
  try {
    // Expect a Page<BackendCrisisEvent> structure from the backend
    const response = await api.get<Page<BackendCrisisEvent>>('/crisis-events/all', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Map backend events to frontend format
    const mappedContent = response.data.content.map(mapBackendToFrontendEvent);

    // Return a new Page object with mapped content
    return {
      ...response.data,
      content: mappedContent
    };
  } catch (error) {
    console.error('Error fetching all crisis events:', error);
    throw error;
  }
}

/**
 * Fetches all active crisis events from the backend API.
 * Maps backend field names to frontend expected properties.
 *
 * @returns {Promise<CrisisEvent[]>} Array of active crisis events.
 */
export async function fetchActiveCrisisEvents(): Promise<CrisisEvent[]> {
  try {
    // Try to fetch from API first
    try {
      const response = await api.get<Page<BackendCrisisEvent>>('/crisis-events/all', {
        params: {
          size: 100 // Request a large page size to get most/all events
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if we got valid data
      if (response.data && response.data.content && response.data.content.length > 0) {
        console.log(`Loaded ${response.data.content.length} crisis events from API`);

        // Map backend events to frontend format
        const mappedEvents = response.data.content
        .filter(event => event.active) // Only include active events
        .map(mapBackendToFrontendEvent);

        console.log('Mapped crisis events:', mappedEvents);
        return mappedEvents;
      }
    } catch (apiError) {
      console.warn('Could not fetch crisis events from API, using dummy data instead:', apiError);
    }

    // If API fails or returns no data, use dummy data
    console.log("Using dummy crisis event data for demonstration");

    return [
      {
        id: 1,
        name: "Flooding in Downtown",
        description: "Heavy rainfall has caused flooding in the downtown area",
        latitude: 63.4305, // Centered on the default map location
        longitude: 10.3951,
        level: 2, // Medium severity (orange)
        startTime: new Date().toISOString(),
        isActive: true,
        createdBy: "admin@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Fire Warning",
        description: "Fire warning due to dry conditions in the northern forest area",
        latitude: 63.4405, // Slightly north
        longitude: 10.3951,
        level: 3, // High severity (red)
        startTime: new Date().toISOString(),
        isActive: true,
        createdBy: "admin@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: "Storm Advisory",
        description: "Strong winds expected in the coastal areas",
        latitude: 63.4305,
        longitude: 10.4151, // Slightly east
        level: 1, // Low severity (yellow)
        startTime: new Date().toISOString(),
        isActive: true,
        createdBy: "admin@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching active crisis events:', error);
    return [];
  }
}

/**
 * Fetches crisis events within a specific radius from the given coordinates.
 *
 * @param {number} latitude - The latitude coordinate
 * @param {number} longitude - The longitude coordinate
 * @param {number} radiusInMeters - The radius in meters to search within
 * @returns {Promise<CrisisEvent[]>} Array of crisis events in the specified area.
 */
export async function fetchCrisisEventsNearby(
  latitude: number,
  longitude: number,
  radiusInMeters: number
): Promise<CrisisEvent[]> {
  try {
    // Try API first
    try {
      const response = await api.get<BackendCrisisEvent[]>('/crisis-events/nearby', {
        params: {
          latitude,
          longitude,
          radius: radiusInMeters
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // If successful, map and return the data
      if (response.data && response.data.length > 0) {
        const mappedEvents = response.data.map(mapBackendToFrontendEvent);
        return mappedEvents;
      }
    } catch (apiError) {
      console.warn('Could not fetch nearby crisis events from API, using filtered dummy data', apiError);
    }

    // If API fails, filter dummy data based on distance
    const dummyEvents = await fetchActiveCrisisEvents();

    // Filter by calculating distance
    return dummyEvents.filter(event => {
      const distance = calculateDistance(latitude, longitude, event.latitude, event.longitude);
      return distance <= radiusInMeters;
    });
  } catch (error) {
    console.error('Error fetching nearby crisis events:', error);
    return [];
  }
}

/**
 * Calculates the distance between two points using the Haversine formula.
 *
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns The distance in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Earth radius in meters
  const EARTH_RADIUS = 6371000;

  // Convert degrees to radians
  const lat1Rad = lat1 * Math.PI / 180;
  const lon1Rad = lon1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const lon2Rad = lon2 * Math.PI / 180;

  // Haversine formula
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return EARTH_RADIUS * c;
}
