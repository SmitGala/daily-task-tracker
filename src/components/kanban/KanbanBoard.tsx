import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { KANBAN_COLUMNS } from '@/constants/tasks'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'
import { TaskCard } from '@/components/tasks/TaskCard'
import { updateTaskStatus } from '@/services/tasks'
import { useToastStore } from '@/stores/toastStore'
import type { Task, TaskStatus } from '@/types'
import { groupTasksByStatus } from '@/utils/tasks'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const COLUMN_IDS = new Set(KANBAN_COLUMNS.map((c) => c.id))

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const addToast = useToastStore((s) => s.addToast)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const grouped = groupTasksByStatus(tasks)

  const resolveStatus = (overId: string | number): TaskStatus | null => {
    if (COLUMN_IDS.has(overId as TaskStatus)) {
      return overId as TaskStatus
    }
    const overTask = tasks.find((t) => t.id === overId)
    return overTask?.status ?? null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = resolveStatus(over.id)
    if (!newStatus || newStatus === task.status) return

    try {
      await updateTaskStatus(task, newStatus, task.status)
      if (newStatus === 'completed') {
        addToast('Task completed')
      }
    } catch {
      addToast('Failed to move task', 'error')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-4 -mx-0 scrollbar-hide">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            status={column.id}
            tasks={grouped[column.id]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-[280px] rotate-2">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
