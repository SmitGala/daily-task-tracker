import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastContainer } from '@/components/ui/Toast'
import { router } from '@/router'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastContainer />
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
