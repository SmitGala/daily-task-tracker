import { useState, type FormEvent } from 'react'
import { PRIORITY_OPTIONS } from '@/constants/tasks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Task, TaskPriority } from '@/types'
import type { CreateTaskInput } from '@/services/tasks'
import { formatTagsForInput, parseTagsInput } from '@/utils/tasks'

interface TaskFormProps {
  initial?: Task
  onSubmit: (data: CreateTaskInput) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

export function TaskForm({ initial, onSubmit, onCancel, submitLabel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.split('T')[0] : '',
  )
  const [tagsInput, setTagsInput] = useState(
    initial ? formatTagsForInput(initial.tags) : '',
  )
  const [estimatedHours, setEstimatedHours] = useState(
    initial?.estimatedHours?.toString() ?? '',
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Task title is required')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onSubmit({
        title,
        description,
        priority,
        dueDate: dueDate || null,
        tags: parseTagsInput(tagsInput),
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        notes,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
        error={error ?? undefined}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add more details..."
        rows={3}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <Input
        label="Tags"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="design, bug, urgent"
      />

      <Input
        label="Estimated hours"
        type="number"
        min="0"
        step="0.5"
        value={estimatedHours}
        onChange={(e) => setEstimatedHours(e.target.value)}
        placeholder="e.g. 2"
      />

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Personal notes..."
        rows={2}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
