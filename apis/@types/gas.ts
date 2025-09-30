// Re-export types from the local gas consumption types file
export type { GasConsumptionResponse, GasConsumptionEntry } from '@/app/(main)/services/gas-consumption/types';

export interface GasConsumptionRequest {
  date: string;
  kilometersDriven: number;
  litersConsumed: number;
}

export interface GasConsumptionUpdateRequest extends GasConsumptionRequest {
  gasId: string;
}

export interface GasConsumptionFilter {
  startDate?: string;
  endDate?: string;
}

