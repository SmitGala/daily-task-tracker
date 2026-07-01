import { useState, type FormEvent } from 'react'
import { PROJECT_COLORS, PROJECT_EMOJIS } from '@/constants/projects'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Project } from '@/types'
import type { CreateProjectInput } from '@/services/projects'
import { cn } from '@/utils'

interface ProjectFormProps {
  initial?: Project
  onSubmit: (data: CreateProjectInput) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

export function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? PROJECT_EMOJIS[0])
  const [color, setColor] = useState(initial?.color ?? PROJECT_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onSubmit({ name, description, emoji, color })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="My awesome project"
        autoFocus
        error={error ?? undefined}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What is this project about?"
        rows={3}
      />

      <div className="space-y-2">
        <span className="block text-sm font-medium text-text-secondary">Icon</span>
        <div className="flex flex-wrap gap-2">
          {PROJECT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all',
                emoji === e
                  ? 'bg-accent/20 ring-2 ring-accent scale-105'
                  : 'bg-surface-elevated hover:bg-border-subtle',
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-text-secondary">Color</span>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'h-9 w-9 rounded-full transition-all',
                color === c && 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110',
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

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
