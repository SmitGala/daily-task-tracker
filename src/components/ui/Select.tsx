import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-11 px-3 rounded-xl bg-surface-elevated border border-border',
            'text-text-primary text-sm appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            'transition-colors',
            error && 'border-danger focus:ring-danger',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
