import { Link } from 'react-router-dom'
import { FolderKanban, ListTodo } from 'lucide-react'
import type { ActivityItem } from '@/hooks/useDashboardStats'
import { formatRelativeTime } from '@/utils/date'

interface RecentActivityListProps {
  items: ActivityItem[]
}

export function RecentActivityList({ items }: RecentActivityListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-6">No recent activity yet.</p>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={item.href}
            className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface-elevated transition-colors"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
              style={{
                backgroundColor: item.color ? `${item.color}22` : '#6366f122',
              }}
            >
              {item.emoji ?? (
                item.kind === 'project' ? (
                  <FolderKanban className="h-4 w-4 text-accent" />
                ) : (
                  <ListTodo className="h-4 w-4 text-accent" />
                )
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
              <p className="text-xs text-text-muted truncate">{item.meta}</p>
            </div>
            <span className="text-[10px] text-text-muted shrink-0">
              {formatRelativeTime(item.timestamp)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
