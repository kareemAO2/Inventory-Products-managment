import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthResponse, AuthUser } from './authApi'

export interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  sessionInitialized: boolean
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  sessionInitialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.sessionInitialized = true
    },
    clearCredentials(state) {
      state.accessToken = null
      state.user = null
      state.sessionInitialized = true
    },
  },
})

export const { clearCredentials, setCredentials } = authSlice.actions
export default authSlice.reducer
