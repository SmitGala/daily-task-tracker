export type TaskStatus = 'not_picked' | 'in_progress' | 'completed'

export type TaskPriority = 'high' | 'medium' | 'low'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string
  emoji: string
  color: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectTaskCounts {
  notPicked: number
  inProgress: number
  completed: number
  total: number
}

export const EMPTY_TASK_COUNTS: ProjectTaskCounts = {
  notPicked: 0,
  inProgress: 0,
  completed: 0,
  total: 0,
}

export interface Task {
  id: string
  userId: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  tags: string[]
  estimatedHours: number | null
  actualHours: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export type TaskHistoryAction = 'created' | 'status_changed' | 'updated'

export interface TaskHistoryEntry {
  id: string
  action: TaskHistoryAction
  fromStatus?: TaskStatus
  toStatus?: TaskStatus
  details?: string
  createdAt: string
}

export interface DailyLog {
  id: string
  userId: string
  date: string
  completedTaskIds: string[]
  hoursWorked: number
  createdAt: string
  updatedAt: string
}

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}
