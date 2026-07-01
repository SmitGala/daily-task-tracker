import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import type { Task } from '@/types'
import { formatDueDate, isOverdue } from '@/utils/tasks'
import { cn } from '@/utils'

interface TaskListItemProps {
  task: Task
  projectName?: string
  projectEmoji?: string
  showProject?: boolean
}

export function TaskListItem({
  task,
  projectName,
  projectEmoji,
  showProject = true,
}: TaskListItemProps) {
  const dueLabel = formatDueDate(task.dueDate)
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <Link
      to={`/projects/${task.projectId}`}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-elevated p-3',
        'hover:border-border active:scale-[0.99] transition-all',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {dueLabel && (
            <span className={cn('text-[11px]', overdue ? 'text-danger' : 'text-text-muted')}>
              {overdue ? 'Overdue · ' : ''}{dueLabel}
            </span>
          )}
          {showProject && projectName && (
            <span className="text-[11px] text-text-muted truncate">
              {projectEmoji} {projectName}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
    </Link>
  )
}
