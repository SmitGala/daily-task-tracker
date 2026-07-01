import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-subtle bg-surface p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-muted mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent ? `${accent}22` : '#6366f122' }}
        >
          <Icon className="h-4 w-4" style={{ color: accent ?? '#6366f1' }} />
        </div>
      </div>
    </div>
  )
}
