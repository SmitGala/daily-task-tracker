import { useDroppable } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  const isEmpty = tasks.length === 0

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-[62vw] max-w-[210px] sm:w-52 shrink-0 snap-center flex-col kanban-pan-x',
        'rounded-2xl border border-border-subtle bg-surface/50',
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 py-3 border-b border-border-subtle kanban-pan-x select-none">
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
        data-scroll-container={isEmpty ? undefined : true}
        className={cn(
          'flex-1 min-h-0 transition-colors',
          isEmpty
            ? 'kanban-pan-x flex flex-col items-center justify-center gap-2 p-4 text-center'
            : 'kanban-pan-y overflow-y-auto overscroll-contain p-2 space-y-2',
          isOver && 'bg-accent/5 ring-1 ring-inset ring-accent/20',
        )}
      >
        {isEmpty ? (
          <>
            <div className="flex items-center gap-1 text-text-muted/60">
              <ChevronLeft className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Swipe left or right to switch columns
            </p>
            <p className="text-[10px] text-text-muted/70">Drop tasks here</p>
          </>
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
