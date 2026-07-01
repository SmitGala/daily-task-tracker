import { useDroppable } from '@dnd-kit/core'
import { KANBAN_COLUMNS } from '@/constants/tasks'
import { DraggableTaskCard } from '@/components/kanban/DraggableTaskCard'
import type { Task, TaskStatus } from '@/types'
import { cn } from '@/utils'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const column = KANBAN_COLUMNS.find((c) => c.id === status)!
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      className={cn(
        'flex w-[85vw] sm:w-72 shrink-0 snap-center flex-col',
        'rounded-2xl border border-border-subtle bg-surface/50',
        'max-h-[calc(100dvh-220px)]',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border-subtle">
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <h2 className="text-sm font-semibold text-text-primary">{column.title}</h2>
        <span className="ml-auto text-xs font-medium text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px] transition-colors',
          isOver && 'bg-accent/5 ring-1 ring-inset ring-accent/20',
        )}
      >
        {tasks.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-8 px-2">
            Drop tasks here
          </p>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  )
}
