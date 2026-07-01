import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { completeRedirectSignIn, logOut, signInWithGoogle } from '@/firebase/auth'
import { auth } from '@/firebase/config'

interface AuthContextValue {
  user: User | null
  loading: boolean
  redirecting: boolean
  error: string | null
  signIn: (rememberMe: boolean) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    completeRedirectSignIn()
      .catch((err) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : 'Failed to complete sign in.'
        setError(message)
      })
      .finally(() => {
        if (active) setRedirecting(false)
      })

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (rememberMe: boolean) => {
    setError(null)
    setRedirecting(true)
    try {
      await signInWithGoogle(rememberMe)
    } catch (err) {
      setRedirecting(false)
      const message =
        err instanceof Error ? err.message : 'Failed to sign in. Please try again.'
      setError(message)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await logOut()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign out. Please try again.'
      setError(message)
      throw err
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({ user, loading, redirecting, error, signIn, signOut, clearError }),
    [user, loading, redirecting, error, signIn, signOut, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
