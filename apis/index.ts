import {
  createApi,
  fetchBaseQuery,
  retry,
  BaseQueryApi,
  FetchBaseQueryError,
  FetchArgs,
} from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DomainUrl from '@/apis/Domain';
import { login, logout } from '@/redux/authReducer';
import { RootState } from '@/redux';
import tagTypes from './tagTypes';

const rawBaseQuery = (baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

// Create our baseQuery instance
const baseQuery = async (args: FetchArgs, api: BaseQueryApi, extraOptions: object) => {
  const baseUrl = `${DomainUrl}/api/v1`;
  return rawBaseQuery(baseUrl)(args, api, extraOptions);
};

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 });

const baseQueryWithReauth = async (args: FetchArgs, api: BaseQueryApi, extraOptions: object) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);

  const getNewAccessToken = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    const refreshResult = (await baseQueryWithRetry(
      {
        url: '/auth/refresh-token',
        method: 'post',
        body: { refresh: refreshToken },
      },
      api,
      extraOptions
    )) as { data: { access_token: string; refresh_token: string } };

    return refreshResult;
  };

  const saveTheNewAccessTokenAndRetrySameRequest = async (newAccessToken: string) => {
    AsyncStorage.setItem('token', newAccessToken);
    api.dispatch(login(newAccessToken));
    result = (await baseQueryWithRetry(args, api, extraOptions)) as {
      error: FetchBaseQueryError;
    };
  };

  // Check if token expired (401 Unauthorized)
  const isTokenExpired = result?.error?.status === 401;

  if (isTokenExpired) {
    const refreshResult = await getNewAccessToken();

    if (refreshResult.data?.access_token) {
      await saveTheNewAccessTokenAndRetrySameRequest(refreshResult.data.access_token);
      // Also update the refresh token if provided
      if (refreshResult.data.refresh_token) {
        AsyncStorage.setItem('refreshToken', refreshResult.data.refresh_token);
      }
    } else {
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('refreshToken');
      api.dispatch(logout());
    }
  }

  return result;
};

/**
 * Create a base API to inject endpoints into elsewhere.
 * Components using this API should import from the injected site,
 * in order to get the appropriate types,
 * and to ensure that the file injecting the endpoints is loaded
 */
const api = createApi({
  /**
   * `reducerPath` is optional and will not be required by most users.
   * This is useful if you have multiple API definitions,
   * e.g. where each has a different domain, with no interaction between endpoints.
   * Otherwise, a single API definition should be used in order to support tag invalidation,
   * among other features
   */
  reducerPath: 'splitApi',
  /**
   * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
   */
  baseQuery: baseQueryWithReauth,
  /**
   * Tag types must be defined in the original API definition
   * for any tags that would be provided by injected endpoints
   */
  tagTypes,
  /**
   * This api has endpoints injected in adjacent files,
   * which is why no endpoints are shown below.
   * If you want all endpoints defined in the same file, they could be included here instead
   */
  endpoints: () => ({}),
});

export default api;
