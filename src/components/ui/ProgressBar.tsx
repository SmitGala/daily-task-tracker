import { cn } from '@/utils'

interface ProgressBarProps {
  value: number
  color?: string
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  color = '#6366f1',
  className,
  showLabel = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Progress</span>
          <span className="font-medium text-text-secondary">{clamped}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
