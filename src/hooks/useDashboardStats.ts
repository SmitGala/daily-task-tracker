import { useMemo } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useDailyLog } from '@/hooks/useDailyLog'
import type { Project, Task } from '@/types'
import { isDueToday, isSameDay } from '@/utils/date'
import { isOverdue } from '@/utils/tasks'
import { getCompletionPercent } from '@/utils/projects'

export interface ActivityItem {
  id: string
  kind: 'task' | 'project'
  title: string
  meta: string
  timestamp: string
  href: string
  emoji?: string
  color?: string
}

export interface DashboardStats {
  projectCount: number
  pending: number
  inProgress: number
  completed: number
  totalTasks: number
  completionPercent: number
  todaysTasks: Task[]
  overdueTasks: Task[]
  completedTodayCount: number
  hoursWorkedToday: number
  recentActivity: ActivityItem[]
}

function buildActivity(
  tasks: Task[],
  projects: Project[],
  projectMap: Map<string, Project>,
): ActivityItem[] {
  const taskActivity: ActivityItem[] = tasks.slice(0, 15).map((task) => {
    const project = projectMap.get(task.projectId)
    return {
      id: `task-${task.id}`,
      kind: 'task',
      title: task.title,
      meta: project ? `${project.emoji} ${project.name}` : 'Task updated',
      timestamp: task.updatedAt,
      href: `/projects/${task.projectId}`,
      emoji: project?.emoji,
      color: project?.color,
    }
  })

  const projectActivity: ActivityItem[] = projects.slice(0, 5).map((project) => ({
    id: `project-${project.id}`,
    kind: 'project',
    title: project.name,
    meta: project.archived ? 'Project archived' : 'Project updated',
    timestamp: project.updatedAt,
    href: `/projects/${project.id}`,
    emoji: project.emoji,
    color: project.color,
  }))

  return [...taskActivity, ...projectActivity]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
}

export function useDashboardStats() {
  const { activeProjects, projects, loading: projectsLoading } = useProjects()
  const { tasks, loading: tasksLoading } = useAllTasks()
  const { log, loading: logLoading } = useDailyLog()

  const stats = useMemo((): DashboardStats => {
    const projectMap = new Map(projects.map((p) => [p.id, p]))
    const pending = tasks.filter((t) => t.status === 'not_picked').length
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const totalTasks = tasks.length

    const todaysTasks = tasks
      .filter((t) => isDueToday(t.dueDate) && t.status !== 'completed')
      .sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 }
        return priority[a.priority] - priority[b.priority]
      })

    const overdueTasks = tasks
      .filter((t) => isOverdue(t.dueDate, t.status))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

    const completedTodayFromTasks = tasks.filter(
      (t) => t.status === 'completed' && isSameDay(t.updatedAt),
    )

    const completedTodayCount = Math.max(
      log?.completedTaskIds.length ?? 0,
      completedTodayFromTasks.length,
    )

    return {
      projectCount: activeProjects.length,
      pending,
      inProgress,
      completed,
      totalTasks,
      completionPercent: getCompletionPercent(completed, totalTasks),
      todaysTasks,
      overdueTasks,
      completedTodayCount,
      hoursWorkedToday: log?.hoursWorked ?? 0,
      recentActivity: buildActivity(tasks, projects, projectMap),
    }
  }, [tasks, projects, activeProjects, log])

  return {
    stats,
    projects,
    loading: projectsLoading || tasksLoading || logLoading,
  }
}

export function useTodayStats() {
  const { tasks, loading: tasksLoading } = useAllTasks()
  const { log, loading: logLoading } = useDailyLog()
  const { projects } = useProjects()

  const data = useMemo(() => {
    const projectMap = new Map(projects.map((p) => [p.id, p]))

    const todaysTasks = tasks.filter(
      (t) => isDueToday(t.dueDate) && t.status !== 'completed',
    )

    const completedToday = tasks.filter((t) => {
      if (log?.completedTaskIds.includes(t.id)) return true
      return t.status === 'completed' && isSameDay(t.updatedAt)
    })

    const remainingToday = todaysTasks.length
    const completedCount = completedToday.length
    const totalForDay = remainingToday + completedCount
    const productivityPercent =
      totalForDay > 0 ? Math.round((completedCount / totalForDay) * 100) : 0

    const hoursWorked = log?.hoursWorked ?? 0

    return {
      todaysTasks,
      completedToday,
      remainingToday,
      completedCount,
      hoursWorked,
      productivityPercent,
      projectMap,
    }
  }, [tasks, log, projects])

  return { ...data, loading: tasksLoading || logLoading }
}
