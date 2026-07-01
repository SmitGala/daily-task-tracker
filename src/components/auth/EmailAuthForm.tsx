import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils'

type AuthMode = 'signin' | 'register'

export function EmailAuthForm() {
  const { signInWithEmail, registerWithEmail, error, clearError } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password, rememberMe)
      } else {
        await registerWithEmail(email, password, rememberMe)
      }
    } catch {
      // error in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-xl bg-surface-elevated p-1">
        <button
          type="button"
          onClick={() => {
            setMode('signin')
            clearError()
          }}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
            mode === 'signin'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-muted',
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register')
            clearError()
          }}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
            mode === 'register'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-muted',
          )}
        >
          Create account
        </button>
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Password"
        type="password"
        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min. 6 characters"
        minLength={6}
        required
      />

      <label className="flex items-center gap-3 cursor-pointer select-none px-1">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="sr-only peer"
        />
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
            rememberMe
              ? 'bg-accent border-accent text-white'
              : 'border-border bg-surface-elevated',
          )}
        >
          {rememberMe && (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-sm text-text-secondary">Remember me</span>
      </label>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger text-center px-2"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      <Button type="submit" className="w-full" loading={loading} size="lg">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  )
}
