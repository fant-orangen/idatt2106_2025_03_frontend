export interface MeetingPlaceDto {
  /** The database ID */
  id: number;

  /** Name of the meeting place */
  name: string;

  /** Optional longer description */
  description?: string;

  /** Latitude (in decimal degrees) */
  latitude: number;

  /** Longitude (in decimal degrees) */
  longitude: number;

  /** Optional human‐readable address */
  address?: string;

}
