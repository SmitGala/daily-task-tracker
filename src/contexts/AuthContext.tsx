import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { logOut, signInWithGoogle } from '@/firebase/auth'
import { auth } from '@/firebase/config'

interface AuthContextValue {
  user: User | null
  loading: boolean
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (rememberMe: boolean) => {
    setError(null)
    try {
      await signInWithGoogle(rememberMe)
    } catch (err) {
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
    () => ({ user, loading, error, signIn, signOut, clearError }),
    [user, loading, error, signIn, signOut, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
