import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sun,
} from 'lucide-react'
import { cn } from '@/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 nav-safe-area bg-surface/95 backdrop-blur-xl border-t border-border-subtle">
      <div className="mx-auto max-w-lg px-1">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest ? rest.end : false}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-colors duration-200',
                  isActive
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text-secondary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-0 -m-1 rounded-xl bg-accent/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn('relative h-5 w-5', isActive && 'stroke-[2.5]')}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
