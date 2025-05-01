
export interface CrisisEventDto {
  id: number;
  name: string;
  description?: string;
  severity: 'green' | 'yellow' | 'red';
  epicenterLatitude: number;
  epicenterLongitude: number;
  radius: number | null;
  startTime: string;
  updatedAt: string;
  createdByUserId: number;
  active: boolean;
  scenarioThemeId: number;
}

export interface CrisisEventChange {
  id: number;
  crisisEventId: number;
  changeType: 'creation' | 'level_change' | 'description_update' | 'epicenter_moved';
  oldValue: string | null;
  newValue: string | null;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrisisEventPreviewDto {
  id: number;
  name: string;
  severity: 'green' | 'yellow' | 'red'; // Assuming these are the values in CrisisEvent.Severity enum
  startTime: string; // ISO string format for LocalDateTime
}
