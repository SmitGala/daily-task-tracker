import { useState } from 'react'
import { ArrowRight, Clock, History, Pencil, Trash2 } from 'lucide-react'
import { KANBAN_COLUMNS, STATUS_OPTIONS } from '@/constants/tasks'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useTaskHistory } from '@/hooks/useProjectTasks'
import {
  deleteTask,
  updateTask,
  updateTaskStatus,
  type CreateTaskInput,
} from '@/services/tasks'
import { useToastStore } from '@/stores/toastStore'
import type { Task, TaskStatus } from '@/types'
import { formatDueDate, getStatusLabel } from '@/utils/tasks'

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

export function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { history, loading: historyLoading } = useTaskHistory(open && task ? task.id : null)
  const addToast = useToastStore((s) => s.addToast)

  if (!task) return null

  const handleUpdate = async (data: CreateTaskInput) => {
    await updateTask(task.id, task.projectId, data)
    addToast('Task updated', 'info')
    setEditing(false)
  }

  const handleMove = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return
    setMoving(true)
    try {
      await updateTaskStatus(task, newStatus, task.status)
      if (newStatus === 'completed') {
        addToast('Task completed')
      } else {
        addToast('Task moved', 'info')
      }
    } finally {
      setMoving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteTask(task.id, task.projectId)
      addToast('Task deleted', 'info')
      onClose()
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleClose = () => {
    setEditing(false)
    setConfirmDelete(false)
    onClose()
  }

  const dueLabel = formatDueDate(task.dueDate)
  const moveOptions = STATUS_OPTIONS.filter((opt) => opt.value !== task.status)

  return (
    <Modal open={open} onClose={handleClose} title={editing ? 'Edit Task' : task.title}>
      {editing ? (
        <TaskForm
          initial={task}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Save Changes"
        />
      ) : confirmDelete ? (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Delete <strong className="text-text-primary">{task.title}</strong>? This cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <PriorityBadge priority={task.priority} />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
              <span>{getStatusLabel(task.status)}</span>
              {dueLabel && <span>· Due {dueLabel}</span>}
            </div>
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {task.description && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
                Description
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {task.description}
              </p>
            </section>
          )}

          {task.notes && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
                Notes
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{task.notes}</p>
            </section>
          )}

          {(task.estimatedHours != null || task.actualHours != null) && (
            <div className="flex gap-4 text-sm text-text-secondary">
              {task.estimatedHours != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Est. {task.estimatedHours}h
                </span>
              )}
              {task.actualHours != null && (
                <span>Actual {task.actualHours}h</span>
              )}
            </div>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              History
            </h3>
            {historyLoading ? (
              <p className="text-xs text-text-muted">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-xs text-text-muted">No history yet.</p>
            ) : (
              <ul className="space-y-2 max-h-36 overflow-y-auto">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="text-xs text-text-secondary border-l-2 border-border pl-3"
                  >
                    <span className="text-text-primary">
                      {entry.details ??
                        (entry.fromStatus && entry.toStatus
                          ? `${getStatusLabel(entry.fromStatus)} → ${getStatusLabel(entry.toStatus)}`
                          : entry.action)}
                    </span>
                    <span className="block text-text-muted mt-0.5">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {moveOptions.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
                Move to
              </h3>
              <div className="grid gap-2">
                {moveOptions.map((opt) => {
                  const column = KANBAN_COLUMNS.find((c) => c.id === opt.value)
                  return (
                    <Button
                      key={opt.value}
                      variant="secondary"
                      className="w-full justify-between"
                      loading={moving}
                      onClick={() => handleMove(opt.value)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: column?.color }}
                        />
                        Move to {opt.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-text-muted" />
                    </Button>
                  )
                })}
              </div>
            </section>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
