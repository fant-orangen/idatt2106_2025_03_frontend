// src/models/BackendCrisisEvent.ts

/**
 * Represents the raw data structure for a Crisis Event received from the backend API.
 * Matches the structure defined in CrisisEvent.java in the backend.
 */
export interface BackendCrisisEvent {
  id: number;
  name: string;
  description?: string;
  severity: 'green' | 'yellow' | 'red'; // Enum values from backend
  epicenterLatitude: number;
  epicenterLongitude: number;
  radius: number; // Ensure unit (meters/km) consistency with backend
  startTime: string; // ISO Date string
  updatedAt: string; // ISO Date string
  createdByUser: { id: number; /* potentially other fields like name */ }; // Structure might vary based on backend serialization
  active: boolean;
}
