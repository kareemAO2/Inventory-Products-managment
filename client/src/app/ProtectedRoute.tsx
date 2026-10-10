import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from './hooks'
import { SessionLoading } from './SessionLoading'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { accessToken, sessionInitialized, user } = useAppSelector(
    (state) => state.auth,
  )

  if (!sessionInitialized) {
    return <SessionLoading />
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
