import { create } from 'zustand'
import type { TaskPriority, TaskStatus } from '@/types'

export type DueDateFilter = 'all' | 'today' | 'overdue' | 'week' | 'none'

export interface FilterState {
  query: string
  priority: TaskPriority | 'all'
  status: TaskStatus | 'all'
  projectId: string | 'all'
  dueDate: DueDateFilter
  tag: string
  setQuery: (query: string) => void
  setPriority: (priority: TaskPriority | 'all') => void
  setStatus: (status: TaskStatus | 'all') => void
  setProjectId: (projectId: string | 'all') => void
  setDueDate: (dueDate: DueDateFilter) => void
  setTag: (tag: string) => void
  reset: () => void
}

const initial = {
  query: '',
  priority: 'all' as const,
  status: 'all' as const,
  projectId: 'all' as const,
  dueDate: 'all' as const,
  tag: '',
}

export const useFilterStore = create<FilterState>((set) => ({
  ...initial,
  setQuery: (query) => set({ query }),
  setPriority: (priority) => set({ priority }),
  setStatus: (status) => set({ status }),
  setProjectId: (projectId) => set({ projectId }),
  setDueDate: (dueDate) => set({ dueDate }),
  setTag: (tag) => set({ tag }),
  reset: () => set(initial),
}))
