import { motion } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Card } from '@/components/ui/Card'

export function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30"
          >
            <CheckSquare className="h-8 w-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">TaskFlow</h1>
          <p className="text-sm text-text-secondary">
            Your personal project manager.
            <br />
            Simple. Fast. Just for you.
          </p>
        </div>

        <Card variant="glass" className="p-6">
          <GoogleSignInButton />
        </Card>

        <p className="mt-6 text-center text-xs text-text-muted">
          Sign in with your Google account to sync across devices.
        </p>
      </motion.div>
    </div>
  )
}
