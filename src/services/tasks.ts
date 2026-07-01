import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import {
  recordTaskCompleted,
  removeTaskFromDailyLog,
} from '@/services/dailyLogs'
import type { Task, TaskHistoryAction, TaskHistoryEntry, TaskStatus } from '@/types'
import { timestampToISO } from '@/utils/firestore'

export interface CreateTaskInput {
  title: string
  description?: string
  priority: Task['priority']
  dueDate?: string | null
  tags?: string[]
  estimatedHours?: number | null
  actualHours?: number | null
  notes?: string
  status?: TaskStatus
}

function mapTaskDoc(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    userId: data.userId as string,
    projectId: data.projectId as string,
    title: data.title as string,
    description: (data.description as string) ?? '',
    status: (data.status as TaskStatus) ?? 'not_picked',
    priority: (data.priority as Task['priority']) ?? 'medium',
    dueDate: data.dueDate ? timestampToISO(data.dueDate) : null,
    tags: (data.tags as string[]) ?? [],
    estimatedHours: (data.estimatedHours as number | null) ?? null,
    actualHours: (data.actualHours as number | null) ?? null,
    notes: (data.notes as string) ?? '',
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
  }
}

function mapHistoryDoc(id: string, data: Record<string, unknown>): TaskHistoryEntry {
  return {
    id,
    action: data.action as TaskHistoryAction,
    fromStatus: data.fromStatus as TaskStatus | undefined,
    toStatus: data.toStatus as TaskStatus | undefined,
    details: data.details as string | undefined,
    createdAt: timestampToISO(data.createdAt),
  }
}

async function touchProject(projectId: string) {
  await updateDoc(doc(db, 'projects', projectId), {
    updatedAt: serverTimestamp(),
  })
}

async function addHistoryEntry(
  taskId: string,
  entry: {
    action: TaskHistoryAction
    fromStatus?: TaskStatus
    toStatus?: TaskStatus
    details?: string
  },
) {
  await addDoc(collection(db, 'tasks', taskId, 'history'), {
    ...entry,
    createdAt: serverTimestamp(),
  })
}

export async function createTask(
  userId: string,
  projectId: string,
  input: CreateTaskInput,
): Promise<string> {
  const docRef = await addDoc(collection(db, 'tasks'), {
    userId,
    projectId,
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
    status: input.status ?? 'not_picked',
    priority: input.priority,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    tags: input.tags ?? [],
    estimatedHours: input.estimatedHours ?? null,
    actualHours: input.actualHours ?? null,
    notes: (input.notes ?? '').trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await addHistoryEntry(docRef.id, {
    action: 'created',
    toStatus: input.status ?? 'not_picked',
    details: 'Task created',
  })
  await touchProject(projectId)

  return docRef.id
}

export async function updateTask(
  taskId: string,
  projectId: string,
  input: Partial<CreateTaskInput>,
): Promise<void> {
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }
  if (input.title !== undefined) updates.title = input.title.trim()
  if (input.description !== undefined) updates.description = input.description.trim()
  if (input.priority !== undefined) updates.priority = input.priority
  if (input.dueDate !== undefined) {
    updates.dueDate = input.dueDate ? new Date(input.dueDate) : null
  }
  if (input.tags !== undefined) updates.tags = input.tags
  if (input.estimatedHours !== undefined) updates.estimatedHours = input.estimatedHours
  if (input.actualHours !== undefined) updates.actualHours = input.actualHours
  if (input.notes !== undefined) updates.notes = input.notes.trim()
  if (input.status !== undefined) updates.status = input.status

  await updateDoc(doc(db, 'tasks', taskId), updates)
  await addHistoryEntry(taskId, { action: 'updated', details: 'Task updated' })
  await touchProject(projectId)
}

export async function updateTaskStatus(
  task: Pick<Task, 'id' | 'projectId' | 'userId' | 'actualHours' | 'estimatedHours'>,
  newStatus: TaskStatus,
  previousStatus: TaskStatus,
): Promise<void> {
  if (newStatus === previousStatus) return

  const hoursForLog = task.actualHours ?? task.estimatedHours ?? 0

  await updateDoc(doc(db, 'tasks', task.id), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  })
  await addHistoryEntry(task.id, {
    action: 'status_changed',
    fromStatus: previousStatus,
    toStatus: newStatus,
    details: `Moved to ${newStatus.replace('_', ' ')}`,
  })
  await touchProject(task.projectId)

  if (newStatus === 'completed' && previousStatus !== 'completed') {
    await recordTaskCompleted(task.userId, task.id, hoursForLog)
  }
  if (previousStatus === 'completed' && newStatus !== 'completed') {
    await removeTaskFromDailyLog(task.userId, task.id, hoursForLog)
  }
}

export async function deleteTask(taskId: string, projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId))
  await touchProject(projectId)
}

export { mapTaskDoc, mapHistoryDoc }

export function projectTasksQuery(userId: string, projectId: string) {
  return query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    where('projectId', '==', projectId),
    orderBy('updatedAt', 'desc'),
  )
}

export function taskHistoryQuery(taskId: string) {
  return query(
    collection(db, 'tasks', taskId, 'history'),
    orderBy('createdAt', 'desc'),
  )
}
