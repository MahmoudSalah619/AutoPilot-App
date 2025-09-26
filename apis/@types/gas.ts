export interface GasConsumptionResponse {
  message: string;
  gasRecord: {
    efficiencyKmPerLiter: number;
    gasId: string;
    vehicleId: string;
    date: string;
    kilometersDriven: number;
    litersConsumed: number;
    created_at: string;
  };
}
export interface GasConsumptionRequest {
  date: string;
  kilometersDriven: number;
  litersConsumed: number;
}
