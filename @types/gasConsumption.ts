export interface GasConsumptionEntry {
  id: string;
  date: string;
  kilometersTotal: number; // Total odometer reading
  litersFilled: number; // Liters consumed/filled
  kmPerLiter?: number; // Calculated efficiency (optional, will be calculated)
  kilometersDriven?: number; // Distance driven since last entry
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
  kilometersTotal: number;
  litersFilled: number;
}