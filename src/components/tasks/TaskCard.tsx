import { type HTMLAttributes } from 'react'
import { Calendar, GripVertical } from 'lucide-react'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import type { Task } from '@/types'
import { formatDueDate, isOverdue } from '@/utils/tasks'
import { cn } from '@/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
}

export function TaskCard({
  task,
  onClick,
  isDragging,
  dragHandleProps,
}: TaskCardProps) {
  const dueLabel = formatDueDate(task.dueDate)
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface-elevated p-3',
        'transition-shadow duration-200',
        isDragging && 'shadow-lg ring-2 ring-accent/40 opacity-90',
        onClick && 'cursor-pointer hover:border-border active:scale-[0.99]',
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
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
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <button
            type="button"
            className="mt-0.5 shrink-0 touch-none text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing"
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag task"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-text-primary leading-snug">
              {task.title}
            </p>
            <PriorityBadge priority={task.priority} />
          </div>

          {(dueLabel || task.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
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
    </div>
  )
}
