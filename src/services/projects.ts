import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Project } from '@/types'
import { timestampToISO } from '@/utils/firestore'

export interface CreateProjectInput {
  name: string
  description: string
  emoji: string
  color: string
}

function mapProjectDoc(id: string, data: Record<string, unknown>): Project {
  return {
    id,
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

export async function createProject(
  userId: string,
  input: CreateProjectInput,
): Promise<string> {
  const docRef = await addDoc(collection(db, 'projects'), {
    userId,
    name: input.name.trim(),
    description: input.description.trim(),
    emoji: input.emoji,
    color: input.color,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateProject(
  projectId: string,
  input: Partial<CreateProjectInput>,
): Promise<void> {
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }
  if (input.name !== undefined) updates.name = input.name.trim()
  if (input.description !== undefined) updates.description = input.description.trim()
  if (input.emoji !== undefined) updates.emoji = input.emoji
  if (input.color !== undefined) updates.color = input.color

  await updateDoc(doc(db, 'projects', projectId), updates)
}

export async function setProjectArchived(
  projectId: string,
  archived: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'projects', projectId), {
    archived,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProject(
  userId: string,
  projectId: string,
): Promise<void> {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    where('projectId', '==', projectId),
  )
  const tasksSnapshot = await getDocs(tasksQuery)

  const batch = writeBatch(db)
  tasksSnapshot.docs.forEach((taskDoc) => batch.delete(taskDoc.ref))
  batch.delete(doc(db, 'projects', projectId))
  await batch.commit()
}

export { mapProjectDoc }
