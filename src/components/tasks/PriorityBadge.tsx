import type { TaskPriority } from '@/types'
import { getPriorityLabel, getPriorityStyle } from '@/utils/tasks'
import { cn } from '@/utils'

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        getPriorityStyle(priority),
        className,
      )}
    >
      {getPriorityLabel(priority)}
    </span>
  )
}
