import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckSquare, Copy, ExternalLink } from 'lucide-react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getSiteUrl, isIOSStandalone } from '@/utils/device'

export function LoginPage() {
  const [copied, setCopied] = useState(false)
  const iosHomeScreen = isIOSStandalone()
  const siteUrl = getSiteUrl()

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback ignored
    }
  }

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

        {iosHomeScreen && (
          <Card className="mb-4 border-warning/30 bg-warning/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning mt-0.5" />
              <div className="space-y-3 text-sm">
                <p className="font-medium text-text-primary">iPhone Home Screen tip</p>
                <p className="text-text-secondary leading-relaxed">
                  Google login on iPhone shortcuts often fails. Use{' '}
                  <strong className="text-text-primary">Safari</strong> instead:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-text-secondary text-xs">
                  <li>Copy the link below</li>
                  <li>Paste in Safari and open</li>
                  <li>Sign in with Google there</li>
                  <li>Bookmark Safari — don&apos;t use Home Screen for login</li>
                </ol>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={copyUrl}>
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy link'}
                  </Button>
                  <a href={siteUrl} className="flex-1" target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4" />
                      Open Safari
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        )}

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
