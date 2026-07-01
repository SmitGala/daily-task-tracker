import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { mapProjectDoc } from '@/services/projects'
import type { Project } from '@/types'

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) =>
          mapProjectDoc(docSnap.id, docSnap.data()),
        )
        setProjects(next)
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

  const activeProjects = projects.filter((p) => !p.archived)
  const archivedProjects = projects.filter((p) => p.archived)

  return { projects, activeProjects, archivedProjects, loading, error }
}
