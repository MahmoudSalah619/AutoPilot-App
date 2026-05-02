import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/hooks/supaBaseUseClient';

export const supabaseApi = createApi({
  reducerPath: 'supabaseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['SupabaseData'],
  endpoints: (builder) => ({
    // Example endpoint using Supabase
    getSupabaseData: builder.query<any, string>({
      queryFn: async (tableName) => {
        try {
          const { data, error } = await supabase.from(tableName).select('*');

          if (error) {
            return { error: { status: 500, data: error } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ['SupabaseData'],
    }),

    // Example mutation
    insertSupabaseData: builder.mutation<any, { tableName: string; payload: any }>({
      queryFn: async ({ tableName, payload }) => {
        try {
          const { data, error } = await supabase.from(tableName).insert(payload).select();

          if (error) {
            return { error: { status: 500, data: error } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ['SupabaseData'],
    }),
  }),
});

export const { useGetSupabaseDataQuery, useInsertSupabaseDataMutation } = supabaseApi;
