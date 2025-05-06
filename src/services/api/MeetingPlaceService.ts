import api from '@/services/api/AxiosInstance';
import type { MeetingPlaceDto } from '@/types/meetingPlace';

export async function fetchMeetingPlacesNearby(
  latitude: number,
  longitude: number,
  distanceKm: number = 1000
): Promise<MeetingPlaceDto[]> {
  const response = await api.get<MeetingPlaceDto[]>(
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
