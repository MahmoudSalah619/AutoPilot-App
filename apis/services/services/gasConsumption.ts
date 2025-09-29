import api from '@/apis';
import { GasConsumptionRequest, GasConsumptionResponse } from '@/apis/@types/gas';
import { getVehicleId } from '@/utils/getVehicleId';

export const gasApi = api.injectEndpoints({
  endpoints: (build) => {
    // Get vehicle ID once when endpoints are being built (at runtime, not module load time)
    const vehicleId = getVehicleId();
    
    return {
      getGasConsumption: build.query<GasConsumptionResponse, void>({
        query: () => ({
          url: `/vehicles/${vehicleId}/gas/`,
        }),
        providesTags: ['gas'],
      }),

      addGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionRequest>({
        query: (body) => ({
          url: `/vehicles/${vehicleId}/gas/`,
          method: 'POST',
          body: { ...body, user_type: 'store_user' },
        }),
        invalidatesTags: ['gas'],
      }),

      updateGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionRequest>({
        query: (body) => ({
          url: `/vehicles/${vehicleId}/gas/`,
          method: 'PUT',
          body: { ...body, user_type: 'store_user' },
        }),
        invalidatesTags: ['gas'],
      }),

      deleteGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionRequest>({
        query: (body) => ({
          url: `/vehicles/${vehicleId}/gas/`,
          method: 'DELETE',
          body: { ...body, user_type: 'store_user' },
        }),
        invalidatesTags: ['gas'],
      }),
    };
  },
});

export const {
  useGetGasConsumptionQuery,
  useAddGasConsumptionMutation,
  useUpdateGasConsumptionMutation,
  useDeleteGasConsumptionMutation,
} = gasApi;
