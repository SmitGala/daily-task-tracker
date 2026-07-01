import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AuthLoadingSkeleton } from '@/components/ui/Skeleton'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <AuthLoadingSkeleton />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) return <AuthLoadingSkeleton />
  if (user) return <Navigate to="/" replace />

  return <Outlet />
}
