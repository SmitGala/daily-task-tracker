import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/hooks/useAuth'
import { dailyLogDocId, mapDailyLogDoc } from '@/services/dailyLogs'
import type { DailyLog } from '@/types'
import { getDateKey } from '@/utils/date'

const EMPTY_LOG: Omit<DailyLog, 'id' | 'userId' | 'date'> = {
  completedTaskIds: [],
  hoursWorked: 0,
  createdAt: '',
  updatedAt: '',
}

export function useDailyLog(date: string = getDateKey()) {
  const { user } = useAuth()
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLog(null)
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'dailyLogs'),
      where('userId', '==', user.uid),
      where('date', '==', date),
      limit(1),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0]
          setLog(mapDailyLogDoc(docSnap.id, docSnap.data()))
        } else {
          setLog({
            id: dailyLogDocId(user.uid, date),
            userId: user.uid,
            date,
            ...EMPTY_LOG,
          })
        }
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user, date])

  return { log, loading }
}
