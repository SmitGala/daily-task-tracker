import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { DailyLog, Project, Task } from '@/types'
import { timestampToISO } from '@/utils/firestore'

export interface ExportProject extends Omit<Project, 'id'> {
  _exportId: string
}

export interface ExportTask extends Omit<Task, 'id' | 'projectId'> {
  _exportProjectId: string
}

export interface ExportData {
  version: 1
  exportedAt: string
  projects: ExportProject[]
  tasks: ExportTask[]
  dailyLogs: Omit<DailyLog, 'id'>[]
}

function mapExportProject(id: string, data: Record<string, unknown>): ExportProject {
  return {
    _exportId: id,
    userId: data.userId as string,
    name: data.name as string,
    description: (data.description as string) ?? '',
    emoji: (data.emoji as string) ?? '📋',
    color: (data.color as string) ?? '#6366f1',
    archived: (data.archived as boolean) ?? false,
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
  }
}

function mapExportTask(_id: string, data: Record<string, unknown>): ExportTask {
  return {
    _exportProjectId: data.projectId as string,
    userId: data.userId as string,
    title: data.title as string,
    description: (data.description as string) ?? '',
    status: data.status as Task['status'],
    priority: data.priority as Task['priority'],
    dueDate: data.dueDate ? timestampToISO(data.dueDate) : null,
    tags: (data.tags as string[]) ?? [],
    estimatedHours: (data.estimatedHours as number | null) ?? null,
    actualHours: (data.actualHours as number | null) ?? null,
    notes: (data.notes as string) ?? '',
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
  }
}

export async function exportUserData(userId: string): Promise<ExportData> {
  const [projectsSnap, tasksSnap, logsSnap] = await Promise.all([
    getDocs(query(collection(db, 'projects'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'tasks'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'dailyLogs'), where('userId', '==', userId))),
  ])

  const projects = projectsSnap.docs.map((d) => mapExportProject(d.id, d.data()))
  const tasks = tasksSnap.docs.map((d) => mapExportTask(d.id, d.data()))
  const dailyLogs = logsSnap.docs.map((d) => {
    const data = d.data()
    return {
      userId: data.userId as string,
      date: data.date as string,
      completedTaskIds: (data.completedTaskIds as string[]) ?? [],
      hoursWorked: (data.hoursWorked as number) ?? 0,
      createdAt: timestampToISO(data.createdAt),
      updatedAt: timestampToISO(data.updatedAt),
    }
  })

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    tasks,
    dailyLogs,
  }
}

export function downloadJson(data: ExportData, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function importUserData(
  userId: string,
  data: ExportData,
): Promise<{ projects: number; tasks: number; logs: number }> {
  if (data.version !== 1) {
    throw new Error('Unsupported backup version')
  }

  await deleteAllUserData(userId)

  const projectIdMap = new Map<string, string>()

  for (const project of data.projects) {
    const { _exportId, ...fields } = project
    const ref = await addDoc(collection(db, 'projects'), {
      ...fields,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    projectIdMap.set(_exportId, ref.id)
  }

  for (const task of data.tasks) {
    const { _exportProjectId, ...fields } = task
    const projectId = projectIdMap.get(_exportProjectId)
    if (!projectId) continue

    await addDoc(collection(db, 'tasks'), {
      ...fields,
      userId,
      projectId,
      dueDate: fields.dueDate ? new Date(fields.dueDate) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  for (const log of data.dailyLogs) {
    const ref = doc(db, 'dailyLogs', `${userId}_${log.date}`)
    const batch = writeBatch(db)
    batch.set(ref, {
      userId,
      date: log.date,
      completedTaskIds: log.completedTaskIds,
      hoursWorked: log.hoursWorked,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await batch.commit()
  }

  return {
    projects: data.projects.length,
    tasks: data.tasks.length,
    logs: data.dailyLogs.length,
  }
}

export async function deleteAllUserData(userId: string): Promise<void> {
  const [projectsSnap, tasksSnap, logsSnap] = await Promise.all([
    getDocs(query(collection(db, 'projects'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'tasks'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'dailyLogs'), where('userId', '==', userId))),
  ])

  for (const taskDoc of tasksSnap.docs) {
    const historySnap = await getDocs(
      collection(db, 'tasks', taskDoc.id, 'history'),
    )
    const batch = writeBatch(db)
    historySnap.docs.forEach((h) => batch.delete(h.ref))
    batch.delete(taskDoc.ref)
    await batch.commit()
  }

  let batch = writeBatch(db)
  let count = 0

  const flush = async () => {
    if (count > 0) {
      await batch.commit()
      batch = writeBatch(db)
      count = 0
    }
  }

  for (const d of projectsSnap.docs) {
    batch.delete(d.ref)
    count++
    if (count >= 400) await flush()
  }
  for (const d of logsSnap.docs) {
    batch.delete(d.ref)
    count++
    if (count >= 400) await flush()
  }
  await flush()
}
