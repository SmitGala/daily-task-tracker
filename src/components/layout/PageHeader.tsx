import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  color?: string
  showBack?: boolean
  onBack?: () => void
  action?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  emoji,
  color,
  showBack,
  onBack,
  action,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 safe-top">
      <div className="glass border-b border-border-subtle">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          {showBack && (
            <button
              onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {emoji && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: color ? `${color}22` : undefined }}
            >
              {emoji}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
            {subtitle && (
              <p className={cn('text-sm text-text-secondary truncate')}>{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      </div>
    </header>
  )
}
