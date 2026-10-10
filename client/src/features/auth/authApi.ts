import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'
import { clearCredentials, setCredentials } from './authSlice'
import type { AuthState } from './authSlice'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

export interface AuthResponse {
  message: string
  user: AuthUser
  accessToken: string
}

const refreshMutex = new Mutex()

function isAuthResponse(data: unknown): data is AuthResponse {
  if (typeof data !== 'object' || data === null || !('user' in data)) {
    return false
  }

  const user = data.user
  return (
    'accessToken' in data &&
    typeof data.accessToken === 'string' &&
    'message' in data &&
    typeof data.message === 'string' &&
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    typeof user.id === 'string' &&
    'name' in user &&
    typeof user.name === 'string' &&
    'email' in user &&
    typeof user.email === 'string' &&
    'role' in user &&
    typeof user.role === 'string' &&
    'permissions' in user &&
    Array.isArray(user.permissions) &&
    user.permissions.every((permission) => typeof permission === 'string')
  )
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = typeof args === 'string' ? args : args.url
  await refreshMutex.waitForUnlock()

  if (requestUrl === '/auth/refresh') {
    const release = await refreshMutex.acquire()
    try {
      return await baseQuery(args, api, extraOptions)
    } finally {
      release()
    }
  }

  let result = await baseQuery(args, api, extraOptions)
  const shouldRefresh =
    result.error?.status === 401 &&
    requestUrl !== '/auth/login' &&
    requestUrl !== '/auth/logout'

  if (!shouldRefresh) {
    return result
  }

  if (!refreshMutex.isLocked()) {
    const release = await refreshMutex.acquire()
    try {
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      )

      if (isAuthResponse(refreshResult.data)) {
        api.dispatch(setCredentials(refreshResult.data))
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch(clearCredentials())
      }
    } finally {
      release()
    }
  } else {
    await refreshMutex.waitForUnlock()
    const token = (api.getState() as { auth: AuthState }).auth.accessToken
    if (token) {
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(clearCredentials())
    }
  }

  return result
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Workspace'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useRefreshMutation } =
  authApi
