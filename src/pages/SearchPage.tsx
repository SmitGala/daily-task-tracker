import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, Search } from 'lucide-react'
import { FilterPanel } from '@/components/search/FilterPanel'
import { TaskListItem } from '@/components/dashboard/TaskListItem'
import { Header } from '@/components/layout/Header'
import { Input } from '@/components/ui/Input'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useProjects } from '@/hooks/useProjects'
import { useFilterStore } from '@/stores/filterStore'
import { filterProjects, filterTasks } from '@/utils/search'
import { cn } from '@/utils'

export function SearchPage() {
  const { query, setQuery, priority, status, projectId, dueDate, tag } = useFilterStore()
  const { tasks, loading: tasksLoading } = useAllTasks()
  const { projects, loading: projectsLoading } = useProjects()

  const filters = useMemo(
    () => ({ query, priority, status, projectId, dueDate, tag }),
    [query, priority, status, projectId, dueDate, tag],
  )

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters],
  )

  const filteredProjects = useMemo(
    () => filterProjects(projects.filter((p) => !p.archived), query),
    [projects, query],
  )

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  )

  const loading = tasksLoading || projectsLoading

  return (
    <div>
      <Header title="Search" subtitle="Find projects & tasks" showSearch={false} />

      <div className="mx-auto max-w-lg p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, tags..."
            className="pl-10"
          />
        </div>

        <FilterPanel projects={projects} tasks={tasks} />

        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {filteredProjects.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-text-primary mb-2">
                  Projects ({filteredProjects.length})
                </h2>
                <div className="space-y-2">
                  {filteredProjects.map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={`/projects/${project.id}`}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-elevated p-3',
                          'hover:border-border active:scale-[0.99] transition-all',
                        )}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                          style={{ backgroundColor: `${project.color}22` }}
                        >
                          {project.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {project.name}
                          </p>
                          {project.description && (
                            <p className="text-xs text-text-muted truncate">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <FolderKanban className="h-4 w-4 text-text-muted" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold text-text-primary mb-2">
                Tasks ({filteredTasks.length})
              </h2>
              {filteredTasks.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  No tasks match your search.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task, i) => {
                    const project = projectMap.get(task.projectId)
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <TaskListItem
                          task={task}
                          projectName={project?.name}
                          projectEmoji={project?.emoji}
                        />
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
