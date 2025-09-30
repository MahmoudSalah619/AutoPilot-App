export type FilterType = 'All' | 'Completed' | 'Upcoming';
export type DateFilterType = 'All' | 'LastMonth' | 'Last3Months' | 'Last6Months' | 'LastYear' | 'Custom';

export interface FilterState {
  status: FilterType;
  dateRange: DateFilterType;
  customStartDate?: string;
  customEndDate?: string;
}

export interface FilterModalProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}