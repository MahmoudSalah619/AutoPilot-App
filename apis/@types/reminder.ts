export interface ReminderItem {
  reminderId: string;
  vehicleId: string;
  reminderDate: string;
  notes: string;
  isCompleted: boolean;
  completedAt: string;
  created_at: string;
  updated_at: string;
  serviceType: {
    serviceTypeId: string;
    name: string;
    slug: string;
  };
}
export interface ReminderStatistics {
  totalReminders: number;
  upcoming: number;
  completed: number;
  overdue: number;
}

export interface ReminderResponse {
  data: ReminderItem[];
  statistics: ReminderStatistics;
}

export interface ReminderRequest {
  serviceTypeId: string;
  reminderDate: string;
  notes: string;
  isCompleted?: boolean;
}
