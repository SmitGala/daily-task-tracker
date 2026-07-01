import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
        <Icon className="h-7 w-7 text-text-muted" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}
