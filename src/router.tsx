import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicRoute } from '@/components/auth/RouteGuards'
import { PageSkeleton } from '@/components/ui/Skeleton'

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectBoardPage = lazy(() =>
  import('@/pages/ProjectBoardPage').then((m) => ({ default: m.ProjectBoardPage })),
)
const TodayPage = lazy(() =>
  import('@/pages/TodayPage').then((m) => ({ default: m.TodayPage })),
)
const CalendarPage = lazy(() =>
  import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })),
)
const SearchPage = lazy(() =>
  import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: (
          <LazyPage>
            <LoginPage />
          </LazyPage>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: (
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            ),
          },
          {
            path: '/projects',
            element: (
              <LazyPage>
                <ProjectsPage />
              </LazyPage>
            ),
          },
          {
            path: '/projects/:projectId',
            element: (
              <LazyPage>
                <ProjectBoardPage />
              </LazyPage>
            ),
          },
          {
            path: '/today',
            element: (
              <LazyPage>
                <TodayPage />
              </LazyPage>
            ),
          },
          {
            path: '/calendar',
            element: (
              <LazyPage>
                <CalendarPage />
              </LazyPage>
            ),
          },
          {
            path: '/search',
            element: (
              <LazyPage>
                <SearchPage />
              </LazyPage>
            ),
          },
          {
            path: '/settings',
            element: (
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
