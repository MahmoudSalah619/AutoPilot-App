export interface ReminderItem {
  reminder_id: string;
  vehicle_id: string;
  service_type_id: string;
  reminder_date: string;
  notes: string;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderResponse {
  reminders: ReminderItem[];
}

export interface ReminderRequest {
  serviceTypeId: string;
  reminderDate: string;
  notes: string;
  isCompleted?: boolean;
}