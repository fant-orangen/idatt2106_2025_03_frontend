/**
 * Represents the raw data structure for a Crisis Event received from the backend API.
 * Matches the structure defined in CrisisEvent.java in the backend.
 * This interface serves as a bridge between backend and frontend data models.
 */
export interface BackendCrisisEvent {
  /** Unique identifier for the crisis event */
  id: number;
  /** Name/title of the crisis event */
  name: string;
  /** Optional detailed description of the crisis event */
  description?: string;
  /** Severity level of the crisis (green=low, yellow=medium, red=high) */
  severity: 'green' | 'yellow' | 'red';
  /** Latitude coordinate of the crisis epicenter */
  epicenterLatitude: number;
  /** Longitude coordinate of the crisis epicenter */
  epicenterLongitude: number;
  /** Radius of the affected area in meters */
  radius: number;
  /** ISO string timestamp when the crisis event started */
  startTime: string;
  /** ISO string timestamp when the crisis event was last updated */
  updatedAt: string;
  /** Information about the user who created this crisis event */
  createdByUser: { id: number };
  /** Whether the crisis event is currently active */
  active: boolean;
}
