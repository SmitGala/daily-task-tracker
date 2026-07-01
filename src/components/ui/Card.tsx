import { type HTMLAttributes } from 'react'
import { cn } from '@/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass'
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-subtle p-4',
        variant === 'glass' ? 'glass' : 'bg-surface',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
