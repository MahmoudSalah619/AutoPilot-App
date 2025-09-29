export interface GasConsumptionEntry {
  efficiencyKmPerLiter: number;
  gasId: string;
  vehicleId: string;
  date: string;
  kilometersDriven: number;
  litersConsumed: number;
  created_at: string;
}

export interface GasConsumptionStats {
  averageKmPerLiter: number;
  totalKilometersDriven: number;
  totalLitersConsumed: number;
  bestEfficiency: number;
  worstEfficiency: number;
}

export interface AddEntryFormData {
  date: string;
  kilometersDriven: number | string;
  litersConsumed: number | string;
}

export interface GasConsumptionResponse {
  message: string;
  data: GasConsumptionEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  statistics?: {
    averageKmPerLiter: number;
    totalKilometersDriven: number;
    totalLitersConsumed: number;
    bestEfficiency: number;
    worstEfficiency: number;
  };
  filters: {
    from: string | null;
    to: string | null;
  };
  aggregations: any;
}