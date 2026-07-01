import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { mapTaskDoc } from '@/services/tasks'
import type { Task } from '@/types'

export function userTasksQuery(userId: string) {
  return query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
  )
}

export function useAllTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = userTasksQuery(user.uid)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTasks(snapshot.docs.map((d) => mapTaskDoc(d.id, d.data())))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user])

  return { tasks, loading, error }
}
