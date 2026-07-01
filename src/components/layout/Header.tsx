import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getGreeting, getInitials } from '@/utils'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  title: string
  subtitle?: string
  showSearch?: boolean
}

export function Header({ title, subtitle, showSearch = true }: HeaderProps) {
  const { user } = useAuth()
  const displayName = user?.displayName ?? 'there'

  return (
    <header className="sticky top-0 z-40 safe-top">
      <div className="glass border-b border-border-subtle">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-muted mb-0.5">
              {getGreeting()}, {displayName.split(' ')[0]}
            </p>
            <h1 className="text-xl font-semibold text-text-primary truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {showSearch && (
              <Link
                to="/search"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>
            )}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="h-10 w-10 rounded-full ring-2 ring-border object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent ring-2 ring-border">
                {getInitials(displayName)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
