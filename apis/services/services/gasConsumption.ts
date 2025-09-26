import api from '@/apis';
import { GasConsumptionRequest, GasConsumptionResponse } from '@/apis/@types/gas';

export const gasApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGasConsumption: build.query<GasConsumptionResponse, void>({
      query: () => ({
        url: `/vehicles/${147}/gas/`,
      }),
      providesTags: ['gas'],
    }),

    addGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionRequest>({
      query: (body) => ({
        url: `/vehicles/${147}/gas/`,
        method: 'POST',
        body: { ...body, user_type: 'store_user' },
      }),
      invalidatesTags: ['gas'],
    }),

    updateGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionRequest>({
      query: (body) => ({
        url: `/vehicles/${147}/gas/`,
        method: 'PUT',
        body: { ...body, user_type: 'store_user' },
      }),
      invalidatesTags: ['gas'],
    }),

    deleteGasConsumption: build.mutation<GasConsumptionResponse, GasConsumptionRequest>({
      query: (body) => ({
        url: `/vehicles/${147}/gas/`,
        method: 'DELETE',
        body: { ...body, user_type: 'store_user' },
      }),
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
