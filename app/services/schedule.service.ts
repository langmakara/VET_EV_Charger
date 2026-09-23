import { parse12HourTo24Hour } from '~/utils/formatters'

export interface HighlightedDateItem {
  date: string
  textColor: string
  backgroundColor: string
  border: string
}

export const scheduleService = {
  /**
   * Helper to generate list of YYYY-MM-DD date strings between start and end date inclusive
   */
  getDatesInRange(startDateStr: string, endDateStr: string): string[] {
    const dates: string[] = []
    const current = new Date(startDateStr)
    const end = new Date(endDateStr)

    while (current <= end) {
      const year = current.getUTCFullYear()
      const month = String(current.getUTCMonth() + 1).padStart(2, '0')
      const day = String(current.getUTCDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
      current.setUTCDate(current.getUTCDate() + 1)
    }

    return dates
  },

  /**
   * Calculate highlighted date objects (unavailable dates and range selection) for ion-datetime
   */
  calculateHighlightedDates(
    schedulesByMonth: Record<string, any> = {},
    datetimeValue?: string | string[] | null
  ): HighlightedDateItem[] {
    const list: HighlightedDateItem[] = []
    const unavailableSet = new Set<string>()

    for (const schedule of Object.values(schedulesByMonth)) {
      if (schedule && Array.isArray(schedule.unavailableDates)) {
        for (const d of schedule.unavailableDates) {
          const dateStr = d.split('T')[0]
          if (dateStr) {
            unavailableSet.add(dateStr)
            list.push({
              date: dateStr,
              textColor: '#ffffff',
              backgroundColor: '#d62600',
              border: '1px solid #d62600',
            })
          }
        }
      }
    }

    if (Array.isArray(datetimeValue) && datetimeValue.length >= 2) {
      const rawStart = datetimeValue[0]?.split('T')[0]
      const rawEnd = datetimeValue[1]?.split('T')[0]
      if (rawStart && rawEnd) {
        const sorted = [rawStart, rawEnd].sort()
        const startDate = sorted[0]!
        const endDate = sorted[1]!
        const rangeDates = this.getDatesInRange(startDate, endDate)

        for (const dateStr of rangeDates) {
          if (!unavailableSet.has(dateStr)) {
            list.push({
              date: dateStr,
              textColor: '#000000',
              backgroundColor: '#E0E7FF',
              border: '1px solid #E0E7FF',
            })
          }
        }
      }
    }

    return list
  },

  /**
   * Check if date is enabled for ion-datetime picker
   */
  checkIsDateEnabled(
    dateStr: string,
    todayStr: string,
    schedulesByMonth: Record<string, any> = {},
    fetchScheduleForMonth?: (year: number, month: number) => void
  ): boolean {
    if (!dateStr) return false
    const formatted = dateStr.split('T')[0] ?? ''
    if (!formatted || formatted < todayStr) {
      return false
    }

    const parts = formatted.split('-')
    if (parts.length < 3) return false
    const y = parseInt(parts[0]!, 10)
    const m = parseInt(parts[1]!, 10)
    if (isNaN(y) || isNaN(m)) return false

    const key = `${y}-${m}`
    const schedule = schedulesByMonth[key]

    if (!schedule) {
      if (fetchScheduleForMonth) {
        Promise.resolve().then(() => fetchScheduleForMonth(y, m))
      }
      return true
    }

    if (Array.isArray(schedule.unavailableDates)) {
      const unavailableList = schedule.unavailableDates.map((d: string) => d.split('T')[0])
      if (unavailableList.includes(formatted)) {
        return false
      }
    }

    if (Array.isArray(schedule.availableDates) && schedule.availableDates.length > 0) {
      const availableList = schedule.availableDates.map((d: string) => d.split('T')[0])
      if (!availableList.includes(formatted)) {
        return false
      }
    }

    return true
  },

  /**
   * Derive selected date's month key `${year}-${month}` for time slots lookup
   */
  getSelectedDateMonthKey(datetimeValue?: string | string[] | null): string {
    let dateStr = ''
    if (Array.isArray(datetimeValue)) {
      dateStr = datetimeValue[0] || ''
    } else if (typeof datetimeValue === 'string') {
      dateStr = datetimeValue
    }
    if (!dateStr) {
      const today = new Date()
      return `${today.getFullYear()}-${today.getMonth() + 1}`
    }
    const parts = dateStr.split('T')[0]!.split('-')
    if (parts.length >= 2) {
      const y = parseInt(parts[0]!, 10)
      const m = parseInt(parts[1]!, 10)
      return `${y}-${m}`
    }
    return ''
  },

  /**
   * Get set of disabled / busy time slots (24h "HH:mm") for given month
   */
  getDisabledTimeSet(schedulesByMonth: Record<string, any> = {}, monthKey: string): Set<string> {
    const schedule = monthKey ? schedulesByMonth[monthKey] : null
    const slots = schedule?.timeSlots
    if (!slots || !Array.isArray(slots)) return new Set<string>()

    const set = new Set<string>()
    for (const slot of slots) {
      if (slot.isDisabled || slot.isBusy) {
        const hhmm = parse12HourTo24Hour(slot.time)
        if (hhmm) set.add(hhmm)
      }
    }
    return set
  },

  /**
   * Check if a time string ("HH:mm") is enabled
   */
  checkIsTimeEnabled(timeString: string, disabledTimeSet?: Set<string>): boolean {
    if (!timeString) return true
    const [hh, mm] = timeString.split(':')
    const hhmm = `${hh}:${mm}`
    return disabledTimeSet ? !disabledTimeSet.has(hhmm) : true
  },
}
