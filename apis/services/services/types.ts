import api from '@/apis';
import { TypesResponse } from '@/apis/@types/serviceTypes';

export const typesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTypes: build.query<TypesResponse, void>({
      query: () => ({
        url: `/service-types/`,
      }),
      providesTags: ['types'],
    }),
  }),
});

export const { useGetTypesQuery } = typesApi;
