import type { TaskPriority, TaskStatus } from '@/types'

export const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'not_picked', title: 'Not Picked', color: '#71717a' },
  { id: 'in_progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'completed', title: 'Completed', color: '#22c55e' },
]

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not_picked', label: 'Not Picked' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]
