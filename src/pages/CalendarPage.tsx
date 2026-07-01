import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { MonthCalendar } from '@/components/calendar/MonthCalendar'
import { TaskListItem } from '@/components/dashboard/TaskListItem'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useProjects } from '@/hooks/useProjects'
import { getTasksForDate } from '@/utils/search'
import { getDateKey } from '@/utils/date'

export function CalendarPage() {
  const { tasks, loading: tasksLoading } = useAllTasks()
  const { projects, loading: projectsLoading } = useProjects()
  const [selectedDate, setSelectedDate] = useState<string | null>(getDateKey())

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  )

  const dayTasks = useMemo(
    () => (selectedDate ? getTasksForDate(tasks, selectedDate) : []),
    [tasks, selectedDate],
  )

  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  if (tasksLoading || projectsLoading) return <PageSkeleton />

  return (
    <div>
      <Header title="Calendar" subtitle="See what's due" />

      <div className="mx-auto max-w-lg p-4 space-y-4">
        <MonthCalendar
          tasks={tasks}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {selectedDate && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={selectedDate}
          >
            <h2 className="text-sm font-semibold text-text-primary mb-2">
              {selectedLabel}
              <span className="ml-2 text-text-muted font-normal">
                ({dayTasks.length} tasks)
              </span>
            </h2>

            {dayTasks.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6 rounded-xl border border-border-subtle bg-surface">
                No tasks due on this day.
              </p>
            ) : (
              <div className="space-y-2">
                {dayTasks.map((task) => {
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
            )}
          </motion.section>
        )}
      </div>
    </div>
  )
}
