import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-h-[88px] px-3 py-2.5 rounded-xl bg-surface-elevated border border-border',
            'text-text-primary placeholder:text-text-muted text-sm resize-none',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            'transition-colors',
            error && 'border-danger focus:ring-danger',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
