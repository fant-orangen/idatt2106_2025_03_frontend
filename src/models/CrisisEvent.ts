
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
}

export interface UpdateCrisisEventDto {
  name: string;
  description?: string;
  severity: 'green' | 'yellow' | 'red';
  epicenterLatitude: number;
  epicenterLongitude: number;
  radius: number | null;
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
  // Optional joined data
  userName?: string;
}
