import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import {
  completeRedirectSignIn,
  logOut,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from '@/firebase/auth'
import { auth } from '@/firebase/config'
import { getAuthErrorMessage } from '@/utils/authErrors'

interface AuthContextValue {
  user: User | null
  loading: boolean
  redirecting: boolean
  error: string | null
  signInWithGoogle: (rememberMe: boolean) => Promise<void>
  signInWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>
  registerWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>
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
    let unsubscribe: (() => void) | undefined

    ;(async () => {
      setRedirecting(true)
      await completeRedirectSignIn()
      if (active) setRedirecting(false)

      if (!active) return

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
      })
    })()

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const handleGoogleSignIn = useCallback(async (rememberMe: boolean) => {
    setError(null)
    setRedirecting(true)
    try {
      await signInWithGoogle(rememberMe)
    } catch (err) {
      setRedirecting(false)
      setError(getAuthErrorMessage(err))
      throw err
    }
  }, [])

  const handleEmailSignIn = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      setError(null)
      try {
        await signInWithEmail(email, password, rememberMe)
      } catch (err) {
        setError(getAuthErrorMessage(err))
        throw err
      }
    },
    [],
  )

  const handleEmailRegister = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      setError(null)
      try {
        await registerWithEmail(email, password, rememberMe)
      } catch (err) {
        setError(getAuthErrorMessage(err))
        throw err
      }
    },
    [],
  )

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await logOut()
    } catch (err) {
      setError(getAuthErrorMessage(err))
      throw err
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({
      user,
      loading,
      redirecting,
      error,
      signInWithGoogle: handleGoogleSignIn,
      signInWithEmail: handleEmailSignIn,
      registerWithEmail: handleEmailRegister,
      signOut,
      clearError,
    }),
    [
      user,
      loading,
      redirecting,
      error,
      handleGoogleSignIn,
      handleEmailSignIn,
      handleEmailRegister,
      signOut,
      clearError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
