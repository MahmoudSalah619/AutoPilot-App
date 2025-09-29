import api from '@/apis';
import { GasConsumptionRequest, GasConsumptionResponse, GasConsumptionUpdateRequest } from '@/apis/@types/gas';
import { getVehicleId } from '@/utils/getVehicleId';

export const gasApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGasConsumption: build.query<GasConsumptionResponse, void>({
      query: () => {
        const vehicleId = getVehicleId();
        console.log('Vehicle ID in getGasConsumption:', vehicleId);
        return {
          url: `/vehicles/${vehicleId}/gas/`,
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
