import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Archive, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Project, ProjectTaskCounts } from '@/types'
import { getCompletionPercent } from '@/utils/projects'
import { cn } from '@/utils'

interface ProjectCardProps {
  project: Project
  counts: ProjectTaskCounts
  onEdit: (project: Project) => void
  onArchive: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({
  project,
  counts,
  onEdit,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const progress = getCompletionPercent(counts.completed, counts.total)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Link
        to={`/projects/${project.id}`}
        className={cn(
          'block rounded-2xl border border-border-subtle bg-surface p-4',
          'hover:border-border transition-colors active:scale-[0.99]',
          project.archived && 'opacity-60',
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${project.color}22` }}
          >
            {project.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-primary truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                {project.description}
              </p>
            )}
          </div>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
              aria-label="Project options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border border-border-subtle bg-surface-elevated py-1 shadow-xl"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <button
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:bg-border-subtle hover:text-text-primary"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(project)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:bg-border-subtle hover:text-text-primary"
                  onClick={() => {
                    setMenuOpen(false)
                    onArchive(project)
                  }}
                >
                  <Archive className="h-4 w-4" />
                  {project.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-danger hover:bg-danger/10"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(project)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs">
          <Stat label="Pending" value={counts.notPicked} />
          <Stat label="Active" value={counts.inProgress} color="#f59e0b" />
          <Stat label="Done" value={counts.completed} color="#22c55e" />
        </div>

        <ProgressBar value={progress} color={project.color} className="mt-3" />
      </Link>
    </motion.div>
  )
}

function Stat({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      {color && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-secondary">{value}</span>
    </div>
  )
}
