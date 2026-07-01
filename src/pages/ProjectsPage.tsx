import { useState } from 'react'
import { Archive, FolderKanban, Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useProjectTaskCounts } from '@/hooks/useProjectTaskCounts'
import {
  createProject,
  deleteProject,
  setProjectArchived,
  updateProject,
} from '@/services/projects'
import { useToastStore } from '@/stores/toastStore'
import type { Project } from '@/types'
import { cn } from '@/utils'

type ModalMode = 'create' | 'edit' | 'delete' | null

export function ProjectsPage() {
  const { user } = useAuth()
  const { activeProjects, archivedProjects, loading, error } = useProjects()
  const { getCounts } = useProjectTaskCounts()
  const addToast = useToastStore((s) => s.addToast)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => {
    setSelectedProject(null)
    setModalMode('create')
  }

  const openEdit = (project: Project) => {
    setSelectedProject(project)
    setModalMode('edit')
  }

  const openDelete = (project: Project) => {
    setSelectedProject(project)
    setModalMode('delete')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedProject(null)
  }

  const handleCreate = async (data: Parameters<typeof createProject>[1]) => {
    if (!user) return
    await createProject(user.uid, data)
    addToast('Project created')
    closeModal()
  }

  const handleUpdate = async (data: Parameters<typeof createProject>[1]) => {
    if (!selectedProject) return
    await updateProject(selectedProject.id, data)
    addToast('Project updated', 'info')
    closeModal()
  }

  const handleArchive = async (project: Project) => {
    await setProjectArchived(project.id, !project.archived)
    addToast(project.archived ? 'Project restored' : 'Project archived', 'info')
  }

  const handleDelete = async () => {
    if (!user || !selectedProject) return
    setDeleting(true)
    try {
      await deleteProject(user.uid, selectedProject.id)
      addToast('Project deleted', 'info')
      closeModal()
    } finally {
      setDeleting(false)
    }
  }

  const displayedProjects = showArchived ? archivedProjects : activeProjects

  return (
    <div>
      <Header
        title="Projects"
        subtitle={`${activeProjects.length} active`}
      />

      <div className="mx-auto max-w-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="flex-1">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
          {archivedProjects.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowArchived((v) => !v)}
              className={cn(showArchived && 'ring-2 ring-accent')}
              aria-pressed={showArchived}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showArchived && (
          <p className="text-xs text-text-muted px-1">
            Showing archived projects ({archivedProjects.length})
          </p>
        )}

        {loading ? (
          <PageSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        ) : displayedProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={showArchived ? 'No archived projects' : 'No projects yet'}
            description={
              showArchived
                ? 'Archived projects will appear here.'
                : 'Create your first project to start organizing tasks.'
            }
            action={
              !showArchived ? (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              ) : undefined
            }
            className="mt-4"
          />
        ) : (
          <div className="space-y-3">
            {displayedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                counts={getCounts(project.id)}
                onEdit={openEdit}
                onArchive={handleArchive}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalMode === 'create'}
        onClose={closeModal}
        title="New Project"
      >
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={closeModal}
          submitLabel="Create Project"
        />
      </Modal>

      <Modal
        open={modalMode === 'edit'}
        onClose={closeModal}
        title="Edit Project"
      >
        {selectedProject && (
          <ProjectForm
            initial={selectedProject}
            onSubmit={handleUpdate}
            onCancel={closeModal}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      <Modal
        open={modalMode === 'delete'}
        onClose={closeModal}
        title="Delete Project"
      >
        {selectedProject && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Delete <strong className="text-text-primary">{selectedProject.name}</strong>?
              All tasks in this project will also be deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
