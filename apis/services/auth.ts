import api from '@/apis';
import { AuthTokenResponse, LoginBody, User } from '../@types/auth';
// import { SignUpFormData } from '@/app/(auth)/signup/types';
import { VehicleFormData } from '@/app/(auth)/addVehicle/types';

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserInfo: build.query<User, string>({
      query: (token) => ({
        url: '/users/me',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ['User'],
    }),

    login: build.mutation<AuthTokenResponse, LoginBody>({
      query: (body) => {
        return {
          url: '/auth/signin',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['User'],
    }),

    signup: build.mutation<AuthTokenResponse, AuthTokenResponse>({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
    }),
    addVehicle: build.mutation<AuthTokenResponse, string>({
      query: ({ data, token }) => {
        return {
          url: '/vehicles',
          method: 'POST',
          body: data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    }),

    logout: build.mutation({
      query: () => ({
        url: '/auth/logout/',
        method: 'POST',
      }),
    }),

    facebookLogin: build.mutation({
      query: (body) => ({
        url: '/users/facebook/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    googleLogin: build.mutation({
      query: (body) => ({
        url: '/users/gmail/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    appleLogin: build.mutation({
      query: (body) => ({
        url: '/users/apple/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLazyGetUserInfoQuery,
  useLoginMutation,
  useSignupMutation,
  useAddVehicleMutation,
  useLogoutMutation,
  useFacebookLoginMutation,
  useGoogleLoginMutation,
  useAppleLoginMutation,
} = authApi;
