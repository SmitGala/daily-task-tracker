import type { Project, Task, TaskPriority, TaskStatus } from '@/types'
import type { DueDateFilter } from '@/stores/filterStore'
import { getDateKey, isDueToday, startOfDay } from '@/utils/date'
import { isOverdue } from '@/utils/tasks'

export interface SearchFilters {
  query: string
  priority: TaskPriority | 'all'
  status: TaskStatus | 'all'
  projectId: string | 'all'
  dueDate: DueDateFilter
  tag: string
}

function matchesQuery(text: string, query: string): boolean {
  if (!query.trim()) return true
  return text.toLowerCase().includes(query.trim().toLowerCase())
}

function matchesDueDateFilter(task: Task, filter: DueDateFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'none') return !task.dueDate
  if (filter === 'today') return isDueToday(task.dueDate)
  if (filter === 'overdue') return isOverdue(task.dueDate, task.status)
  if (filter === 'week') {
    if (!task.dueDate) return false
    const due = startOfDay(new Date(task.dueDate))
    const today = startOfDay()
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return due >= today && due <= weekEnd
  }
  return true
}

export function filterTasks(tasks: Task[], filters: SearchFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.projectId !== 'all' && task.projectId !== filters.projectId) return false
    if (filters.tag && !task.tags.some((t) => t.toLowerCase() === filters.tag.toLowerCase()))
      return false
    if (!matchesDueDateFilter(task, filters.dueDate)) return false
    if (!filters.query.trim()) return true
    const q = filters.query.trim().toLowerCase()
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.tags.some((t) => t.toLowerCase().includes(q))
    )
  })
}

export function filterProjects(projects: Project[], query: string): Project[] {
  if (!query.trim()) return projects
  return projects.filter(
    (p) =>
      matchesQuery(p.name, query) ||
      matchesQuery(p.description, query),
  )
}

export function getAllTags(tasks: Task[]): string[] {
  const tags = new Set<string>()
  tasks.forEach((t) => t.tags.forEach((tag) => tags.add(tag)))
  return Array.from(tags).sort()
}

export function getTasksForDate(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((t) => {
    if (!t.dueDate) return false
    return getDateKey(new Date(t.dueDate)) === dateKey
  })
}
