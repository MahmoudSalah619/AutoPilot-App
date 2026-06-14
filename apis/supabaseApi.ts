/**
 * Supabase RTK Query API
 *
 * Each Supabase table gets its own typed endpoint.
 * Add new tables by adding a typed query/mutation below.
 *
 * Pattern:
 *   - providesTags per table for fine-grained cache invalidation
 *   - Typed generics instead of `any` for full TypeScript safety
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/apis/supabaseClient';

// ─── Table Types ────────────────────────────────────────────────────────────
// Add your Supabase table row types here as the project grows.
// Example:
// export type Car = {
//   id: string;
//   make: string;
//   model: string;
//   year: number;
//   owner_id: string;
//   created_at: string;
// };

// ─── Tag Types ───────────────────────────────────────────────────────────────
// One tag per table — enables precise cache invalidation per table.
const TAG_TYPES = [] as const;
// Add tags as you add tables, e.g.:
// const TAG_TYPES = ['Cars', 'Bookings', 'Users'] as const;

type TagType = (typeof TAG_TYPES)[number];

// ─── API Definition ──────────────────────────────────────────────────────────
export const supabaseApi = createApi({
  reducerPath: 'supabaseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: TAG_TYPES as unknown as TagType[],
  endpoints: (builder) => ({
    /**
     * ─── Auth ───────────────────────────────────────────────────────────────
     */

    /** Sign in with email + password */
    signInWithEmail: builder.mutation<
      { userId: string; email: string },
      { email: string; password: string }
    >({
      queryFn: async ({ email, password }) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) return { error: { status: 401, data: error.message } };
          return {
            data: {
              userId: data.user?.id ?? '',
              email: data.user?.email ?? '',
            },
          };
        } catch (err) {
          return { error: { status: 500, data: String(err) } };
        }
      },
    }),

    /** Sign up with email + password */
    signUpWithEmail: builder.mutation<
      { userId: string; email: string },
      { email: string; password: string }
    >({
      queryFn: async ({ email, password }) => {
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) return { error: { status: 400, data: error.message } };
          return {
            data: {
              userId: data.user?.id ?? '',
              email: data.user?.email ?? '',
            },
          };
        } catch (err) {
          return { error: { status: 500, data: String(err) } };
        }
      },
    }),

    /** Sign out the current user */
    signOut: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) return { error: { status: 500, data: error.message } };
          return { data: undefined };
        } catch (err) {
          return { error: { status: 500, data: String(err) } };
        }
      },
    }),

    /** Get the currently authenticated session */
    getSession: builder.query<{ userId: string; email: string } | null, void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) return { error: { status: 500, data: error.message } };
          if (!data.session) return { data: null };
          return {
            data: {
              userId: data.session.user.id,
              email: data.session.user.email ?? '',
            },
          };
        } catch (err) {
          return { error: { status: 500, data: String(err) } };
        }
      },
    }),

    /**
     * ─── Add your table-specific endpoints below ────────────────────────────
     *
     * Template (copy-paste and replace placeholders):
     *
     * get<TableName>: builder.query<TableType[], void>({
     *   queryFn: async () => {
     *     try {
     *       const { data, error } = await supabase.from('<table_name>').select('*');
     *       if (error) return { error: { status: 500, data: error.message } };
     *       return { data: data as TableType[] };
     *     } catch (err) {
     *       return { error: { status: 500, data: String(err) } };
     *     }
     *   },
     *   providesTags: ['<TableName>'],
     * }),
     *
     * insert<TableName>: builder.mutation<TableType, Omit<TableType, 'id' | 'created_at'>>({
     *   queryFn: async (payload) => {
     *     try {
     *       const { data, error } = await supabase.from('<table_name>').insert(payload).select().single();
     *       if (error) return { error: { status: 500, data: error.message } };
     *       return { data: data as TableType };
     *     } catch (err) {
     *       return { error: { status: 500, data: String(err) } };
     *     }
     *   },
     *   invalidatesTags: ['<TableName>'],
     * }),
     */
  }),
});

export const {
  useSignInWithEmailMutation,
  useSignUpWithEmailMutation,
  useSignOutMutation,
  useGetSessionQuery,
} = supabaseApi;
