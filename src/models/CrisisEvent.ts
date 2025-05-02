
/**
 * Represents a full crisis event with all details.
 * This interface is used for displaying detailed information about a crisis event.
 */
export interface CrisisEventDto {
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
  radius: number | null;
  /** ISO string timestamp when the crisis event started */
  startTime: string;
  /** ISO string timestamp when the crisis event was last updated */
  updatedAt: string;
  /** User ID of the person who created this crisis event */
  createdByUser: number;
  /** Whether the crisis event is currently active */
  active: boolean;
  /** ID of the associated scenario theme, if any */
  scenarioThemeId: number;
}

export interface UpdateCrisisEventDto {
  /** Name/title of the crisis event */
  name: string;
  /** Optional detailed description of the crisis event */
  description?: string;
  /** Severity level of the crisis (green=low, yellow=medium, red=high) */
  severity: 'green' | 'yellow' | 'red';
  /** Latitude coordinate of the crisis epicenter */
  latitude: number;
  /** Longitude coordinate of the crisis epicenter */
  longitude: number;
  /** Radius of the affected area in meters */
  radius: number | null;
}

/**
 * Represents a change made to a crisis event.
 * Used for tracking the history of modifications to crisis events.
 */
export interface CrisisEventChange {
  /** Unique identifier for this change record */
  id: number;
  /** ID of the crisis event this change belongs to */
  crisisEventId: number;
  /** Type of change that was made */
  changeType: 'creation' | 'level_change' | 'description_update' | 'epicenter_moved';
  /** Previous value before the change (if applicable) */
  oldValue: string | null;
  /** New value after the change (if applicable) */
  newValue: string | null;
  /** User ID of the person who made this change */
  createdByUserId: number;
  /** ISO string timestamp when this change was created */
  createdAt: string;
  /** ISO string timestamp when this change record was last updated */
  updatedAt: string;
}

/**
 * Simplified representation of a crisis event for preview purposes.
 * Contains only essential information needed for listing crisis events.
 */
export interface CrisisEventPreviewDto {
  /** Unique identifier for the crisis event */
  id: number;
  /** Name/title of the crisis event */
  name: string;
  /** Severity level of the crisis (green=low, yellow=medium, red=high) */
  severity: 'green' | 'yellow' | 'red';
  /** ISO string timestamp when the crisis event started */
  startTime: string;
}
