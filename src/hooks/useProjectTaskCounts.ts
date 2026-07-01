import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { EMPTY_TASK_COUNTS, type ProjectTaskCounts, type TaskStatus } from '@/types'

function createEmptyCountsMap(): Record<string, ProjectTaskCounts> {
  return {}
}

function countForStatus(
  counts: ProjectTaskCounts,
  status: TaskStatus,
): ProjectTaskCounts {
  const next = { ...counts, total: counts.total + 1 }
  if (status === 'not_picked') next.notPicked += 1
  if (status === 'in_progress') next.inProgress += 1
  if (status === 'completed') next.completed += 1
  return next
}

export function useProjectTaskCounts() {
  const { user } = useAuth()
  const [countsByProject, setCountsByProject] = useState<
    Record<string, ProjectTaskCounts>
  >({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCountsByProject({})
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const next = createEmptyCountsMap()
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data()
        const projectId = data.projectId as string
        const status = data.status as TaskStatus
        const current = next[projectId] ?? { ...EMPTY_TASK_COUNTS }
        next[projectId] = countForStatus(current, status)
      })
      setCountsByProject(next)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const getCounts = (projectId: string): ProjectTaskCounts =>
    countsByProject[projectId] ?? EMPTY_TASK_COUNTS

  return { countsByProject, getCounts, loading }
}
