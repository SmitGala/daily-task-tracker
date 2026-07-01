import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { Columns3, Plus } from 'lucide-react'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { useProjectTasks } from '@/hooks/useProjectTasks'
import { mapProjectDoc } from '@/services/projects'
import { createTask, type CreateTaskInput } from '@/services/tasks'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useToastStore } from '@/stores/toastStore'
import type { Project, Task } from '@/types'

export function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { tasks, loading: tasksLoading, error: tasksError } = useProjectTasks(projectId)

  useEffect(() => {
    if (!user || !projectId) return

    const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (snap) => {
      if (!snap.exists()) {
        setNotFound(true)
        setProject(null)
      } else {
        const data = mapProjectDoc(snap.id, snap.data())
        if (data.userId !== user.uid) {
          setNotFound(true)
          setProject(null)
        } else {
          setProject(data)
          setNotFound(false)
        }
      }
      setProjectLoading(false)
    })

    return unsubscribe
  }, [user, projectId])

  const handleCreateTask = async (data: CreateTaskInput) => {
    if (!user || !projectId) return
    await createTask(user.uid, projectId, data)
    addToast('Task added')
    setCreateOpen(false)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleDetailClose = () => {
    setSelectedTask(null)
  }

  // Keep selected task in sync with Firestore updates
  const activeTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? selectedTask
    : null

  if (projectLoading) return <PageSkeleton />

  if (notFound || !project) {
    return (
      <div>
        <PageHeader title="Project" showBack onBack={() => navigate('/projects')} />
        <EmptyState
          icon={Columns3}
          title="Project not found"
          description="This project may have been deleted or you don't have access."
          className="mt-8"
        />
      </div>
    )
  }

  return (
    <div className="board-page flex flex-col min-h-0">
      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        emoji={project.emoji}
        color={project.color}
        showBack
        onBack={() => navigate('/projects')}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      {tasksError && (
        <div className="mx-4 mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {tasksError}
        </div>
      )}

      {tasksLoading ? (
        <PageSkeleton />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Columns3}
          title="No tasks yet"
          description="Create your first task to start tracking work on this board."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          }
          className="mt-6"
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <KanbanBoard
            tasks={tasks}
            onTaskClick={handleTaskClick}
          />
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Task">
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Create Task"
        />
      </Modal>

      <TaskDetailModal
        task={activeTask}
        open={!!activeTask}
        onClose={handleDetailClose}
      />
    </div>
  )
}
