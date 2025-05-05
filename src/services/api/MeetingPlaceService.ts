// In frontend/src/services/api/MeetingPlaceService.ts

// Remove or comment out the direct axios import if it exists
// import axios from 'axios';

// Import the configured api instance
import api from '@/services/api/AxiosInstance';
import type { MeetingPlaceDto } from '@/types/meetingPlace';

export async function fetchMeetingPlacesNearby(
  latitude: number,
  longitude: number,
  distanceKm: number = 1000
): Promise<MeetingPlaceDto[]> {
  // Use the 'api' instance here
  const response = await api.get<MeetingPlaceDto[]>(
    // The path should be relative to the baseURL configured in AxiosInstance.ts
    '/public/meeting-places/nearby',
    {
      params: {
        latitude,
        longitude,
        distanceKm,
      },
    }
  );
  return response.data;
}
