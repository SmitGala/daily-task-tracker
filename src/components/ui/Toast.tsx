import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import type { ToastType } from '@/types'
import { cn } from '@/utils'

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const styleMap: Record<ToastType, string> = {
  success: 'border-success/30 text-success',
  error: 'border-danger/30 text-danger',
  info: 'border-accent/30 text-accent',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 inset-x-0 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none safe-top">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className={cn(
                'pointer-events-auto flex items-center gap-2.5 w-full max-w-sm',
                'glass rounded-xl px-4 py-3 border shadow-lg',
                styleMap[toast.type],
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
