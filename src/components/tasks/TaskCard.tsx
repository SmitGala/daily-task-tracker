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
  showDragHint?: boolean
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
}

export function TaskCard({
  task,
  onClick,
  isDragging,
  showDragHint,
  dragHandleProps,
}: TaskCardProps) {
  const dueLabel = formatDueDate(task.dueDate)
  const overdue = isOverdue(task.dueDate, task.status)
  const hasDragHandle = !!(showDragHint || dragHandleProps)

  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-surface-elevated p-2.5',
        'transition-shadow duration-200',
        isDragging && 'shadow-lg ring-2 ring-accent/40 opacity-90',
        onClick && !isDragging && 'cursor-pointer hover:border-border active:scale-[0.99]',
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
      <div className="flex items-stretch gap-1">
        {hasDragHandle && (
          dragHandleProps ? (
            <button
              type="button"
              className={cn(
                'shrink-0 flex items-center justify-center',
                'w-11 -ml-0.5 touch-none select-none self-stretch',
                'text-text-muted hover:text-text-secondary',
                'cursor-grab active:cursor-grabbing active:text-accent',
              )}
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              aria-label="Drag task"
            >
              <GripVertical className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : (
            <div
              className="shrink-0 flex items-center justify-center w-7 -ml-0.5 text-text-muted/70 pointer-events-none self-stretch"
              aria-hidden
            >
              <GripVertical className="h-4 w-4" strokeWidth={2} />
            </div>
          )
        )}
        <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
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
    </div>
  )
}
