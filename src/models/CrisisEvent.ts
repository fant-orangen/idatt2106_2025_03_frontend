
export interface CrisisEventDto {
  id: number;
  name: string;
  description?: string;
  severity: 'green' | 'yellow' | 'red';
  epicenter_latitude: number;
  epicenter_longitude: number;
  radius: number | null;
  start_time: string;
  updated_at: string;
  created_by_user_id: number;
  active: boolean;
}

export interface CrisisEventChange {
  id: number;
  crisis_event_id: number;
  change_type: 'creation' | 'level_change' | 'description_update' | 'epicenter_moved';
  old_value: string | null;
  new_value: string | null;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  // Optional joined data
  user_name?: string;
}
