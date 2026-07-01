import { type ReactNode } from 'react'
import { cn } from '@/utils'

interface SectionCardProps {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ title, action, children, className }: SectionCardProps) {
  return (
    <section className={cn('rounded-2xl border border-border-subtle bg-surface p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
