import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

const THRESHOLD = 64
const MAX_PULL = 88

function getScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || 0
}

function isInsideNoPtr(target: EventTarget | null) {
  return target instanceof Element && !!target.closest('[data-no-ptr]')
}

function isInsideScrolledContainer(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  const container = target.closest('[data-scroll-container]')
  return container instanceof HTMLElement && container.scrollTop > 0
}

interface PullToRefreshProps {
  children: ReactNode
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const pullDistanceRef = useRef(0)

  const setPull = (value: number) => {
    pullDistanceRef.current = value
    setPullDistance(value)
  }

  const doRefresh = useCallback(async () => {
    setRefreshing(true)
    setPull(40)
    try {
      window.location.reload()
    } catch {
      setRefreshing(false)
      setPull(0)
    }
  }, [])

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (refreshing || getScrollTop() > 0) return
      if (isInsideNoPtr(e.target) || isInsideScrolledContainer(e.target)) return

      startY.current = e.touches[0]?.clientY ?? 0
      pulling.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return
      if (getScrollTop() > 0 || isInsideNoPtr(e.target)) {
        pulling.current = false
        setPull(0)
        return
      }

      const y = e.touches[0]?.clientY ?? 0
      const diff = y - startY.current

      if (diff > 0) {
        e.preventDefault()
        setPull(Math.min(diff * 0.45, MAX_PULL))
      } else {
        pulling.current = false
        setPull(0)
      }
    }

    const onTouchEnd = () => {
      if (!pulling.current) return
      pulling.current = false

      if (pullDistanceRef.current >= THRESHOLD) {
        void doRefresh()
      } else {
        setPull(0)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('touchcancel', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [refreshing, doRefresh])

  const showIndicator = pullDistance > 0 || refreshing

  return (
    <>
      <div
        aria-hidden
        className={cn(
          'fixed inset-x-0 z-[60] flex justify-center pointer-events-none safe-top pt-2',
          'transition-opacity duration-150',
          showIndicator ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 8)}px)`,
        }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated border border-border-subtle shadow-lg">
          <Loader2
            className={cn(
              'h-5 w-5 text-accent',
              refreshing && 'animate-spin',
              !refreshing && pullDistance >= THRESHOLD && 'scale-110',
            )}
          />
        </div>
      </div>

      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pulling.current ? undefined : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </>
  )
}
