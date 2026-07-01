import { useEffect, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/tasks/TaskCard'
import type { Task } from '@/types'
import { cn } from '@/utils'

interface DraggableTaskCardProps {
  task: Task
  onClick: () => void
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const didDrag = useRef(false)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, status: task.status },
  })

  useEffect(() => {
    if (isDragging) {
      didDrag.current = true
    }
  }, [isDragging])

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const handleClick = () => {
    if (didDrag.current) {
      didDrag.current = false
      return
    }
    onClick()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-manipulation cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 z-10',
      )}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} onClick={handleClick} isDragging={isDragging} />
    </div>
  )
}
