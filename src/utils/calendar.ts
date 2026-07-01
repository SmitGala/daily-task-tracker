export interface CalendarDay {
  date: Date
  dateKey: string
  isCurrentMonth: boolean
  isToday: boolean
}

export function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  const days: CalendarDay[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    days.push({
      date,
      dateKey,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
    })
  }
  return days
}

export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}
