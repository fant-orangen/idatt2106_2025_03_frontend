export interface MeetingPlace {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isArchived: boolean;
    createdAt: string;
    createdBy: {
        id: number;
        email: string;
    };
}

export interface CreateMeetingPlaceRequest {
    name: string;
    address: string;
}

export interface MeetingPlacePreviewDto {
    id: number;
    name: string;
}

export interface CreateMeetingPlaceDto {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
}
