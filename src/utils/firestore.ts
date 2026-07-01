import { Timestamp } from 'firebase/firestore'

export function timestampToISO(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return new Date().toISOString()
}
