import { useEffect, useRef } from 'react'
import { useAppDispatch } from './hooks'
import { authApi } from '../features/auth/authApi'
import { clearCredentials, setCredentials } from '../features/auth/authSlice'

export function AuthSessionInitializer() {
  const dispatch = useAppDispatch()
  const restoreStarted = useRef(false)

  useEffect(() => {
    if (restoreStarted.current) {
      return
    }
    restoreStarted.current = true

    void dispatch(authApi.endpoints.refresh.initiate())
      .unwrap()
      .then((session) => dispatch(setCredentials(session)))
      .catch(() => dispatch(clearCredentials()))
  }, [dispatch])

  return null
}
