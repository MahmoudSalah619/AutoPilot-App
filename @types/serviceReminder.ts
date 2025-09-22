export interface ServiceReminderEntry {
  id: string;
  date: string; // ISO date string
  service: string;
  notes: string;
  status: 'upcoming' | 'completed';
  createdAt: string; // ISO date string
}

export interface AddReminderFormData {
  date: string;
  service: string;
  notes: string;
}

export interface ServiceReminderStats {
  totalReminders: number;
  upcomingReminders: number;
  completedReminders: number;
  overdueReminders: number;
}