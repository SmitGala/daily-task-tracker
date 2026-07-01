import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/tasks/TaskCard'
import type { Task } from '@/types'

interface DraggableTaskCardProps {
  task: Task
  onClick: () => void
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, status: task.status },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-40' : undefined}
    >
      <TaskCard
        task={task}
        onClick={onClick}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  )
}
