import type { TaskPriority, TaskStatus } from '@/types'

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: 'bg-danger/15 text-danger border-danger/30',
  medium: 'bg-warning/15 text-warning border-warning/30',
  low: 'bg-success/15 text-success border-success/30',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_picked: 'Not Picked',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export function getPriorityStyle(priority: TaskPriority): string {
  return PRIORITY_STYLES[priority]
}

export function getPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority]
}

export function getStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status]
}

export function formatDueDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

export function isOverdue(iso: string | null, status: TaskStatus): boolean {
  if (!iso || status === 'completed') return false
  const due = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function parseTagsInput(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function formatTagsForInput(tags: string[]): string {
  return tags.join(', ')
}

export function groupTasksByStatus<T extends { status: TaskStatus }>(
  tasks: T[],
): Record<TaskStatus, T[]> {
  return {
    not_picked: tasks.filter((t) => t.status === 'not_picked'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  }
}
