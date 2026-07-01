import { Calendar } from 'lucide-react'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import type { Task } from '@/types'
import { formatDueDate, isOverdue } from '@/utils/tasks'
import { cn } from '@/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const dueLabel = formatDueDate(task.dueDate)
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface-elevated p-3',
        'transition-shadow duration-200 select-none',
        isDragging && 'shadow-lg ring-2 ring-accent/40 opacity-90',
        onClick && !isDragging && 'active:scale-[0.99]',
      )}
      onClick={isDragging ? undefined : onClick}
      role={onClick && !isDragging ? 'button' : undefined}
      tabIndex={onClick && !isDragging ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className="min-w-0 space-y-1.5">
        <p className="text-[15px] font-semibold text-text-primary leading-snug line-clamp-3">
          {task.title}
        </p>

        <PriorityBadge priority={task.priority} />

        {(dueLabel || task.tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {dueLabel && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px]',
                  overdue ? 'text-danger' : 'text-text-muted',
                )}
              >
                <Calendar className="h-3 w-3" />
                {dueLabel}
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
