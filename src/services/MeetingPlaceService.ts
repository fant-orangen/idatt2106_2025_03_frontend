import type { MeetingPlace, CreateMeetingPlaceRequest } from '../models/MeetingPlace';
import api from './api/AxiosInstance';

class MeetingPlaceService {
    /**
     * Creates a new meeting place (admin only)
     * @param createDto The meeting place data to create
     * @returns Promise containing the created meeting place
     */
    async createMeetingPlace(createDto: CreateMeetingPlaceRequest): Promise<MeetingPlace> {
        try {
            const response = await api.post('/admin/meeting-places', createDto);
            return response.data;
        } catch (error) {
            console.error('Error creating meeting place:', error);
            throw error;
        }
    }

    /**
     * Archives a meeting place (admin only)
     * @param id The ID of the meeting place to archive
     * @returns Promise containing the archived meeting place
     */
    async archiveMeetingPlace(id: number): Promise<MeetingPlace> {
        try {
            const response = await api.patch(`/admin/meeting-places/${id}/archive`);
            return response.data;
        } catch (error) {
            console.error('Error archiving meeting place:', error);
            throw error;
        }
    }

    /**
     * Activates a meeting place (admin only)
     * @param id The ID of the meeting place to activate
     * @returns Promise containing the activated meeting place
     */
    async activateMeetingPlace(id: number): Promise<MeetingPlace> {
        try {
            const response = await api.patch(`/admin/meeting-places/${id}/activate`);
            return response.data;
        } catch (error) {
            console.error('Error activating meeting place:', error);
            throw error;
        }
    }

    /**
     * Gets all active meeting places within the specified distance of the location
     * @param latitude The latitude of the center point
     * @param longitude The longitude of the center point
     * @param distanceKm Optional distance in kilometers (defaults to 10)
     * @returns Promise containing array of nearby meeting places
     */
    async getNearbyMeetingPlaces(
        latitude: number,
        longitude: number,
        distanceKm: number = 10
    ): Promise<MeetingPlace[]> {
        try {
            const response = await api.get('/public/meeting-places/nearby', {
                params: {
                    latitude,
                    longitude,
                    distanceKm
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching nearby meeting places:', error);
            throw error;
        }
    }
}

export const meetingPlaceService = new MeetingPlaceService();
