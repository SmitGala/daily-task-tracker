import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Loader,
} from 'lucide-react'
import { CompletionRing } from '@/components/dashboard/CompletionRing'
import { RecentActivityList } from '@/components/dashboard/RecentActivityList'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { TaskListItem } from '@/components/dashboard/TaskListItem'
import { Header } from '@/components/layout/Header'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export function DashboardPage() {
  const { stats, projects, loading } = useDashboardStats()
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  if (loading) return <PageSkeleton />

  return (
    <div>
      <Header title="Dashboard" subtitle="Your productivity at a glance" />

      <div className="mx-auto max-w-lg p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Projects"
            value={stats.projectCount}
            icon={FolderKanban}
            accent="#6366f1"
          />
          <StatCard
            label="Total Tasks"
            value={stats.totalTasks}
            icon={ListTodo}
            accent="#8b5cf6"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            accent="#71717a"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={Loader}
            accent="#f59e0b"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            accent="#22c55e"
            className="col-span-2"
          />
        </div>

        <SectionCard title="Completion">
          <div className="flex items-center justify-center py-2">
            <CompletionRing percent={stats.completionPercent} />
          </div>
          <p className="text-center text-xs text-text-muted mt-2">
            {stats.completed} of {stats.totalTasks} tasks completed
          </p>
        </SectionCard>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{stats.todaysTasks.length}</p>
            <p className="text-xs text-text-muted mt-1">Due Today</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-danger">{stats.overdueTasks.length}</p>
            <p className="text-xs text-text-muted mt-1">Overdue</p>
          </div>
        </div>

        {stats.todaysTasks.length > 0 && (
          <SectionCard
            title="Today's Tasks"
            action={
              <Link to="/today" className="text-xs text-accent font-medium">
                View all
              </Link>
            }
          >
            <div className="space-y-2">
              {stats.todaysTasks.slice(0, 4).map((task) => {
                const project = projectMap.get(task.projectId)
                return (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    projectName={project?.name}
                    projectEmoji={project?.emoji}
                  />
                )
              })}
            </div>
          </SectionCard>
        )}

        {stats.overdueTasks.length > 0 && (
          <SectionCard title="Overdue">
            <div className="space-y-2">
              {stats.overdueTasks.slice(0, 4).map((task) => {
                const project = projectMap.get(task.projectId)
                return (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    projectName={project?.name}
                    projectEmoji={project?.emoji}
                  />
                )
              })}
            </div>
          </SectionCard>
        )}

        {stats.todaysTasks.length === 0 && stats.overdueTasks.length === 0 && stats.totalTasks > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/5 p-4">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <p className="text-sm text-text-secondary">You're all caught up for today!</p>
          </div>
        )}

        {stats.totalTasks === 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-4">
            <AlertTriangle className="h-5 w-5 text-text-muted shrink-0" />
            <p className="text-sm text-text-secondary">
              No tasks yet.{' '}
              <Link to="/projects" className="text-accent font-medium">
                Create a project
              </Link>{' '}
              to get started.
            </p>
          </div>
        )}

        <SectionCard title="Recent Activity">
          <RecentActivityList items={stats.recentActivity} />
        </SectionCard>
      </div>
    </div>
  )
}
