import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { SessionLoading } from '../../../app/SessionLoading'

interface GuestRouteProps {
  children: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { accessToken, sessionInitialized, user } = useAppSelector(
    (state) => state.auth,
  )

  if (!sessionInitialized) {
    return <SessionLoading />
  }

  return accessToken && user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  )
}
