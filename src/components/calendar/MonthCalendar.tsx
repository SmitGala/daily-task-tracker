import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildMonthGrid, getMonthLabel } from '@/utils/calendar'
import { getDateKey } from '@/utils/date'
import type { Task } from '@/types'
import { cn } from '@/utils'

interface MonthCalendarProps {
  tasks: Task[]
  selectedDate: string | null
  onSelectDate: (dateKey: string) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MonthCalendar({ tasks, selectedDate, onSelectDate }: MonthCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const days = useMemo(() => buildMonthGrid(year, month), [year, month])

  const taskCountByDate = useMemo(() => {
    const map = new Map<string, number>()
    tasks.forEach((t) => {
      if (!t.dueDate) return
      const key = getDateKey(new Date(t.dueDate))
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [tasks])

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-elevated text-text-secondary transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-text-primary">
          {getMonthLabel(year, month)}
        </h2>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-elevated text-text-secondary transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = taskCountByDate.get(day.dateKey) ?? 0
          const isSelected = selectedDate === day.dateKey

          return (
            <button
              key={day.dateKey}
              onClick={() => onSelectDate(day.dateKey)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl py-2 min-h-[44px] transition-all',
                'hover:bg-surface-elevated active:scale-95',
                !day.isCurrentMonth && 'opacity-30',
                day.isToday && !isSelected && 'ring-1 ring-accent/50',
                isSelected && 'bg-accent text-white',
              )}
            >
              <span className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-text-primary')}>
                {day.date.getDate()}
              </span>
              {count > 0 && (
                <span
                  className={cn(
                    'mt-0.5 h-1 w-1 rounded-full',
                    isSelected ? 'bg-white' : 'bg-accent',
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
