import api from '@/apis';
import { GasConsumptionRequest, GasConsumptionResponse, GasConsumptionUpdateRequest, GasConsumptionFilter } from '@/apis/@types/gas';
import { getVehicleId } from '@/utils/getVehicleId';

export const gasApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGasConsumption: build.query<GasConsumptionResponse, GasConsumptionFilter | void>({
      query: (filters) => {
        const vehicleId = getVehicleId();
        console.log('Vehicle ID in getGasConsumption:', vehicleId);
        
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (filters?.startDate) {
          params.append('from', filters.startDate);
        }
        if (filters?.endDate) {
          params.append('to', filters.endDate);
        }
        
        const queryString = params.toString();
        const url = `/vehicles/${vehicleId}/gas/${queryString ? `?${queryString}` : ''}`;
        
        console.log('Gas consumption query URL:', url);
        
        return {
          url,
        };
      },
      providesTags: ['gas'],
    }),

    addGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionRequest>({
      query: (body) => {
        const vehicleId = getVehicleId();
        console.log('Vehicle ID in addGasConsumption:', vehicleId);
        return {
          url: `/vehicles/${vehicleId}/gas/`,
          method: 'POST',
          body: { ...body },
        };
      },
      invalidatesTags: ['gas'],
    }),

    updateGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionUpdateRequest>({
      query: (body) => {
        const vehicleId = getVehicleId();
        console.log('Vehicle ID in updateGasConsumption:', vehicleId);
        const { gasId, ...requestBody } = body;
        return {
          url: `/vehicles/${vehicleId}/gas/${gasId}`,
          method: 'PUT',
          body: requestBody,
        };
      },
      invalidatesTags: ['gas'],
    }),

    deleteGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionUpdateRequest>({
      query: (body) => {
        const vehicleId = getVehicleId();
        console.log('Vehicle ID in deleteGasConsumption:', vehicleId);
        const { gasId, ...requestBody } = body;
        return {
          url: `/vehicles/${vehicleId}/gas/${gasId}`,
          method: 'DELETE',
          body: requestBody,
        };
      },
      invalidatesTags: ['gas'],
    }),
  }),
});

export const {
  useGetGasConsumptionQuery,
  useAddGasConsumptionMutation,
  useUpdateGasConsumptionMutation,
  useDeleteGasConsumptionMutation,
} = gasApi;
