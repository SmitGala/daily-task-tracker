import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { DailyLog } from '@/types'
import { getDateKey } from '@/utils/date'
import { timestampToISO } from '@/utils/firestore'

function dailyLogDocId(userId: string, date: string): string {
  return `${userId}_${date}`
}

function mapDailyLogDoc(id: string, data: Record<string, unknown>): DailyLog {
  return {
    id,
    userId: data.userId as string,
    date: data.date as string,
    completedTaskIds: (data.completedTaskIds as string[]) ?? [],
    hoursWorked: (data.hoursWorked as number) ?? 0,
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
  }
}

export async function getDailyLog(
  userId: string,
  date: string = getDateKey(),
): Promise<DailyLog | null> {
  const ref = doc(db, 'dailyLogs', dailyLogDocId(userId, date))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapDailyLogDoc(snap.id, snap.data())
}

export async function recordTaskCompleted(
  userId: string,
  taskId: string,
  hours: number = 0,
  date: string = getDateKey(),
): Promise<void> {
  const ref = doc(db, 'dailyLogs', dailyLogDocId(userId, date))
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      userId,
      date,
      completedTaskIds: [taskId],
      hoursWorked: hours,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  const data = snap.data()
  const existing = (data.completedTaskIds as string[]) ?? []
  const alreadyRecorded = existing.includes(taskId)

  await updateDoc(ref, {
    completedTaskIds: alreadyRecorded ? existing : [...existing, taskId],
    hoursWorked: alreadyRecorded
      ? (data.hoursWorked as number) ?? 0
      : ((data.hoursWorked as number) ?? 0) + hours,
    updatedAt: serverTimestamp(),
  })
}

export async function removeTaskFromDailyLog(
  userId: string,
  taskId: string,
  hours: number = 0,
  date: string = getDateKey(),
): Promise<void> {
  const ref = doc(db, 'dailyLogs', dailyLogDocId(userId, date))
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data = snap.data()
  const existing = (data.completedTaskIds as string[]) ?? []
  if (!existing.includes(taskId)) return

  await updateDoc(ref, {
    completedTaskIds: existing.filter((id) => id !== taskId),
    hoursWorked: Math.max(0, ((data.hoursWorked as number) ?? 0) - hours),
    updatedAt: serverTimestamp(),
  })
}

export async function updateHoursWorked(
  userId: string,
  hours: number,
  date: string = getDateKey(),
): Promise<void> {
  const ref = doc(db, 'dailyLogs', dailyLogDocId(userId, date))
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      userId,
      date,
      completedTaskIds: [],
      hoursWorked: hours,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  await updateDoc(ref, {
    hoursWorked: hours,
    updatedAt: serverTimestamp(),
  })
}

export { mapDailyLogDoc, dailyLogDocId }
