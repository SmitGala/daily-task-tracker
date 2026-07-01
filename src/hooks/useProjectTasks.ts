import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import {
  mapTaskDoc,
  projectTasksQuery,
  taskHistoryQuery,
  mapHistoryDoc,
} from '@/services/tasks'
import type { Task, TaskHistoryEntry } from '@/types'

export function useProjectTasks(projectId: string | undefined) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !projectId) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = projectTasksQuery(user.uid, projectId)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) =>
          mapTaskDoc(docSnap.id, docSnap.data()),
        )
        setTasks(next)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user, projectId])

  return { tasks, loading, error }
}

export function useTaskHistory(taskId: string | null) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!taskId) {
      setHistory([])
      return
    }

    setLoading(true)
    const q = taskHistoryQuery(taskId)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const next = snapshot.docs.map((docSnap) =>
        mapHistoryDoc(docSnap.id, docSnap.data()),
      )
      setHistory(next)
      setLoading(false)
    })

    return unsubscribe
  }, [taskId])

  return { history, loading }
}
