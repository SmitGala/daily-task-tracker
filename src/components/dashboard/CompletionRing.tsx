import { cn } from '@/utils'

interface CompletionRingProps {
  percent: number
  size?: number
  className?: string
}

export function CompletionRing({ percent, size = 120, className }: CompletionRingProps) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-surface-elevated"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">{percent}%</span>
        <span className="text-[10px] text-text-muted uppercase tracking-wide">Done</span>
      </div>
    </div>
  )
}
