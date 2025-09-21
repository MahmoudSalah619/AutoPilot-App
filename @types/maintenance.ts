export interface MaintenanceRecord {
  id: string;
  serviceType: string;
  date: string;
  status?: 'Completed' | 'Upcoming';
}

export interface MaintenanceScheduleProps {
  initialData: MaintenanceRecord[];
  type?: 'recent' | 'upcoming' | 'all';
}