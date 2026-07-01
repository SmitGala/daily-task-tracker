import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/constants/tasks'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useFilterStore, type DueDateFilter } from '@/stores/filterStore'
import { getAllTags } from '@/utils/search'
import type { Project, Task } from '@/types'

interface FilterPanelProps {
  projects: Project[]
  tasks: Task[]
}

const DUE_DATE_OPTIONS: { value: DueDateFilter; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Due today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'week', label: 'This week' },
  { value: 'none', label: 'No due date' },
]

export function FilterPanel({ projects, tasks }: FilterPanelProps) {
  const {
    priority,
    status,
    projectId,
    dueDate,
    tag,
    setPriority,
    setStatus,
    setProjectId,
    setDueDate,
    setTag,
    reset,
  } = useFilterStore()

  const tags = getAllTags(tasks)

  return (
    <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Filters</h3>
        <Button variant="ghost" size="sm" onClick={reset}>
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as typeof priority)}
        >
          <option value="all">All</option>
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">All</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          label="Project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="col-span-2"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
          ))}
        </Select>

        <Select
          label="Due date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value as DueDateFilter)}
        >
          {DUE_DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          label="Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </div>
    </div>
  )
}
