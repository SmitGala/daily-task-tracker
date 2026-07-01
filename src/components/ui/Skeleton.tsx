import { cn } from '@/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-elevated',
        className,
      )}
    />
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="grid gap-3 pt-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-accent/30" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}
