import { useState } from 'react'
import { CheckCircle2, Clock, Sun, Target } from 'lucide-react'
import { CompletionRing } from '@/components/dashboard/CompletionRing'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { TaskListItem } from '@/components/dashboard/TaskListItem'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useTodayStats } from '@/hooks/useDashboardStats'
import { updateHoursWorked } from '@/services/dailyLogs'
import { formatTodayHeading } from '@/utils/date'

export function TodayPage() {
  const { user } = useAuth()
  const {
    todaysTasks,
    completedToday,
    remainingToday,
    completedCount,
    hoursWorked,
    productivityPercent,
    projectMap,
    loading,
  } = useTodayStats()

  const [hoursInput, setHoursInput] = useState('')
  const [savingHours, setSavingHours] = useState(false)
  const [editingHours, setEditingHours] = useState(false)

  const handleSaveHours = async () => {
    if (!user) return
    const hours = parseFloat(hoursInput)
    if (Number.isNaN(hours) || hours < 0) return
    setSavingHours(true)
    try {
      await updateHoursWorked(user.uid, hours)
      setEditingHours(false)
      setHoursInput('')
    } finally {
      setSavingHours(false)
    }
  }

  if (loading) return <PageSkeleton />

  const hasAnyToday = todaysTasks.length > 0 || completedToday.length > 0

  return (
    <div>
      <Header title="Today" subtitle={formatTodayHeading()} />

      <div className="mx-auto max-w-lg p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border-subtle bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Remaining</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">{remainingToday}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface p-4">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Completed</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">{completedCount}</p>
          </div>
        </div>

        <SectionCard title="Productivity">
          <div className="flex items-center gap-6">
            <CompletionRing percent={productivityPercent} size={100} />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-text-muted">Hours worked</p>
                {editingHours ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={hoursInput}
                      onChange={(e) => setHoursInput(e.target.value)}
                      placeholder={hoursWorked.toString()}
                      className="h-9"
                    />
                    <Button size="sm" loading={savingHours} onClick={handleSaveHours}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingHours(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setHoursInput(hoursWorked.toString())
                      setEditingHours(true)
                    }}
                    className="flex items-center gap-1.5 mt-0.5 group"
                  >
                    <Clock className="h-4 w-4 text-text-muted" />
                    <span className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                      {hoursWorked}h
                    </span>
                    <span className="text-xs text-text-muted">tap to edit</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                {completedCount} done · {remainingToday} left today
              </p>
            </div>
          </div>
        </SectionCard>

        {!hasAnyToday ? (
          <EmptyState
            icon={Sun}
            title="Nothing scheduled for today"
            description="Tasks with today's due date will show up here. Add a due date when creating tasks."
            className="mt-4"
          />
        ) : (
          <>
            {todaysTasks.length > 0 && (
              <SectionCard title={`Today's Tasks (${todaysTasks.length})`}>
                <div className="space-y-2">
                  {todaysTasks.map((task) => {
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

            {completedToday.length > 0 && (
              <SectionCard title={`Completed Today (${completedToday.length})`}>
                <div className="space-y-2">
                  {completedToday.map((task) => {
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
          </>
        )}
      </div>
    </div>
  )
}
