import type { Trip } from '~/types/api'
import type { SelectOption } from '~/types/drop-down'
import { formatNumber } from '~/utils/formatters'

export const tripService = {
  resolveProvinceId(val?: string | number | null, cityOptions: SelectOption[] = []): number | undefined {
    if (!val) return undefined
    const cleanVal = String(val).trim()
    const numVal = Number(val)
    const isNumeric = !isNaN(numVal) && numVal > 0

    const opt = cityOptions.find((o) => {
      if (isNumeric && Number(o.id) === numVal) return true
      return String(o.value).trim() === cleanVal || String(o.label).trim() === cleanVal
    })

    if (opt?.id != null && Number(opt.id) > 0) {
      return Number(opt.id)
    }
    return isNumeric ? numVal : undefined
  },

  /**
   * Find stop option prioritizing route-specific sublocations for the trip
   */
  findStopOptionForTrip(
    stopValue: string | number,
    trip?: Trip,
    subLocationOptions: SelectOption[] = [],
    provinceSubLocationsMap: Record<string, SelectOption[]> = {},
    cityOptions: SelectOption[] = []
  ): SelectOption | undefined {
    const cleanStopVal = String(stopValue)
    if (!cleanStopVal) return undefined

    if (trip) {
      let fromId = this.resolveProvinceId(trip.destinationFrom, cityOptions)
      let toId = this.resolveProvinceId(trip.goingTo, cityOptions)

      if (!fromId || !toId) {
        for (const options of Object.values(provinceSubLocationsMap)) {
          if (!fromId && trip.destinationFrom) {
            const foundFrom = options.find(
              (opt: any) => String(opt.provinceName || opt.label).trim() === String(trip.destinationFrom).trim()
            )
            if (foundFrom && (foundFrom as any).provinceId) fromId = Number((foundFrom as any).provinceId)
          }
          if (!toId && trip.goingTo) {
            const foundTo = options.find(
              (opt: any) => String(opt.provinceName || opt.label).trim() === String(trip.goingTo).trim()
            )
            if (foundTo && (foundTo as any).provinceId) toId = Number((foundTo as any).provinceId)
          }
        }
      }

      if (fromId && toId) {
        const prefix = `${fromId}_${toId}_`
        for (const [key, options] of Object.entries(provinceSubLocationsMap)) {
          if (key.startsWith(prefix)) {
            const found = options.find(
              (opt) => String(opt.value) === cleanStopVal || String(opt.id) === cleanStopVal
            )
            if (found) return found
          }
        }
      }
    }

    for (const options of Object.values(provinceSubLocationsMap)) {
      const found = options.find(
        (opt) => String(opt.value) === cleanStopVal || String(opt.id) === cleanStopVal
      )
      if (found) return found
    }

    return subLocationOptions.find(
      (opt) => String(opt.value) === cleanStopVal || String(opt.id) === cleanStopVal
    )
  },

  /**
   * Filter sub-location options to exclude options already selected by other stops in the same trip
   */
  filterAvailableSubLocationOptions(
    options: SelectOption[] = [],
    trip?: Trip,
    currentStopId?: number
  ): SelectOption[] {
    if (!options || options.length === 0) return []
    if (!trip?.stops || !Array.isArray(trip.stops)) return options

    const otherSelectedValues = trip.stops
      .filter((s) => s.id !== currentStopId && s.value !== undefined && s.value !== null && s.value !== '')
      .map((s) => String(s.value).trim())

    if (otherSelectedValues.length === 0) return options

    return options.filter((opt) => {
      const optVal = String(opt.value).trim()
      const optId = opt.id !== undefined && opt.id !== null ? String(opt.id).trim() : undefined
      const isSelectedInOtherStop =
        otherSelectedValues.includes(optVal) || (optId !== undefined && otherSelectedValues.includes(optId))
      return !isSelectedInOtherStop
    })
  },

  /**
   * Filter sub-location options for trip based on selected destination (GoingTo)
   */
  getSubLocationOptionsForTrip(
    goingToVal?: string | number | null,
    cityOptions: SelectOption[] = [],
    subLocationOptions: SelectOption[] = [],
    provinceSubLocationsMap: Record<string, SelectOption[]> = {},
    fetchSubLocationsCallback?: (provinceId: string | number) => void
  ): SelectOption[] {
    if (!goingToVal) {
      return subLocationOptions
    }

    const selectedProvince = cityOptions.find(
      (c) => String(c.value) === String(goingToVal) || c.label === goingToVal || String(c.id) === String(goingToVal)
    )

    if (!selectedProvince || selectedProvince.id === undefined || selectedProvince.id === null) {
      return subLocationOptions
    }

    const provinceId = String(selectedProvince.id)

    if (fetchSubLocationsCallback) {
      fetchSubLocationsCallback(provinceId)
    }

    if (provinceSubLocationsMap[provinceId] && provinceSubLocationsMap[provinceId].length > 0) {
      return provinceSubLocationsMap[provinceId]!
    }

    const matching = subLocationOptions.filter(
      (opt) => opt.provinceId !== undefined && String(opt.provinceId) === provinceId
    )

    return matching.length > 0 ? matching : subLocationOptions
  },

  /**
   * Calculate overall numeric sum for stops/add-ons for a single trip
   */
  calculateSingleTripStopsAmount(
    trip: Trip,
    subLocationOptions: SelectOption[] = [],
    provinceSubLocationsMap: Record<string, SelectOption[]> = {},
    cityOptions: SelectOption[] = []
  ): number {
    let sum = 0
    if (Array.isArray(trip.stops)) {
      trip.stops.forEach((stop) => {
        if (stop.value) {
          const option = this.findStopOptionForTrip(
            stop.value,
            trip,
            subLocationOptions,
            provinceSubLocationsMap,
            cityOptions
          )
          if (option && (option as any).amount) {
            const amt = Number((option as any).amount)
            if (!isNaN(amt)) {
              sum += amt
            }
          }
        }
      })
    }
    return Math.round(sum * 100) / 100
  },

  /**
   * Calculate overall numeric sum for stops/add-ons across all trips multiplied by number of cars
   */
  calculateTripsStopsRawAmount(
    trips: Trip[] = [],
    subLocationOptions: SelectOption[] = [],
    provinceSubLocationsMap: Record<string, SelectOption[]> = {},
    cityOptions: SelectOption[] = [],
    carAmount: number | string | null = 1
  ): number {
    let sum = 0

    trips.forEach((trip) => {
      if (Array.isArray(trip.stops)) {
        trip.stops.forEach((stop) => {
          if (stop.value) {
            const option = this.findStopOptionForTrip(
              stop.value,
              trip,
              subLocationOptions,
              provinceSubLocationsMap,
              cityOptions
            )
            if (option && (option as any).amount) {
              const amt = Number((option as any).amount)
              if (!isNaN(amt)) {
                sum += amt
              }
            }
          }
        })
      }
    })

    const cars = carAmount != null && !isNaN(Number(carAmount)) && Number(carAmount) > 0 ? Number(carAmount) : 1
    return Math.round(sum * cars * 100) / 100
  },

  /**
   * Calculate overall formatted total amount for stops/add-ons across all trips
   */
  calculateTripsStopsTotalAmount(
    trips: Trip[] = [],
    subLocationOptions: SelectOption[] = [],
    provinceSubLocationsMap: Record<string, SelectOption[]> = {},
    currency: string = 'USD',
    cityOptions: SelectOption[] = [],
    carAmount: number | string | null = 1
  ): string {
    const rawSum = this.calculateTripsStopsRawAmount(trips, subLocationOptions, provinceSubLocationsMap, cityOptions, carAmount)
    return formatNumber(rawSum, 'currency', { currency })
  },

  /**
   * Add new empty trip group
   */
  addTrip(trips: Trip[]): void {
    const prevTrip = trips.length > 0 ? trips[trips.length - 1] : undefined
    const initialFrom = prevTrip ? (prevTrip.goingTo || '') : ''
    trips.push({
      id: trips.length + 1,
      destinationFrom: initialFrom,
      goingTo: '',
      stops: [{ id: 1, value: '' }],
    })
  },

  /**
   * Remove a trip group and re-index trip IDs
   */
  removeTrip(trips: Trip[], tripId: number): Trip[] {
    const filtered = trips.filter((t) => t.id !== tripId)
    filtered.forEach((t, idx) => {
      t.id = idx + 1
    })
    return filtered
  },

  /**
   * Add a stop to specified trip group
   */
  addStop(trips: Trip[], tripId: number): void {
    const trip = trips.find((t) => t.id === tripId)
    if (trip) {
      if (trip.stops.some((s) => !s.value)) {
        return
      }
      trip.stops.push({
        id: trip.stops.length + 1,
        value: '',
      })
    }
  },

  /**
   * Remove a stop from specified trip group and re-index stop IDs
   */
  removeStop(trips: Trip[], tripId: number, stopId: number): void {
    const trip = trips.find((t) => t.id === tripId)
    if (trip) {
      trip.stops = trip.stops.filter((s) => s.id !== stopId)
      trip.stops.forEach((s, idx) => {
        s.id = idx + 1
      })
    }
  },

  /**
   * Swap destinationFrom and goingTo for a specified trip, resetting its stops
   */
  swapDestinations(trip: Trip, routeSubLocationsMap?: { value: Record<string, SelectOption[]> }): void {
    const temp = trip.destinationFrom
    trip.destinationFrom = trip.goingTo
    trip.goingTo = temp
    trip.stops = [{ id: 1, value: '' }]
    if (routeSubLocationsMap) {
      routeSubLocationsMap.value = {}
    }
  },

  /**
   * Sync destinationFrom for subsequent trips with preceding goingTo
   * and clear goingTo & stops for all subsequent trips if a preceding goingTo changes
   */
  syncAndCascadeClearTrips(trips: Trip[], newGoingTos: string[], oldGoingTos?: string[]): void {
    for (let i = 1; i < trips.length; i++) {
      const currentTrip = trips[i]
      if (!currentTrip) continue
      const prevGoingTo = newGoingTos[i - 1] || ''
      if (currentTrip.destinationFrom !== prevGoingTo) {
        currentTrip.destinationFrom = prevGoingTo
      }
    }

    if (oldGoingTos && Array.isArray(oldGoingTos)) {
      for (let i = 0; i < trips.length; i++) {
        if (newGoingTos[i] !== oldGoingTos[i]) {
          for (let k = i + 1; k < trips.length; k++) {
            const subTrip = trips[k]
            if (subTrip) {
              if (k > i + 1) {
                subTrip.destinationFrom = ''
              }
              subTrip.goingTo = ''
              subTrip.stops = [{ id: 1, value: '' }]
            }
          }
          break
        }
      }
    }
  },

  /**
   * Reset goingTo, stops, and subsequent trips if trip[0].destinationFrom changes
   */
  clearSubsequentTripsOnOriginChange(trips: Trip[], newFrom?: string, oldFrom?: string): void {
    if (oldFrom !== undefined && newFrom !== oldFrom) {
      if (trips[0]) {
        trips[0].goingTo = ''
        trips[0].stops = [{ id: 1, value: '' }]
      }
      for (let k = 1; k < trips.length; k++) {
        const subTrip = trips[k]
        if (subTrip) {
          subTrip.destinationFrom = ''
          subTrip.goingTo = ''
          subTrip.stops = [{ id: 1, value: '' }]
        }
      }
    }
  },

  /**
   * Combine all province option sources (origin, destination, per-trip destination maps)
   */
  getAllProvinceOptions(
    journeyFromOptions: SelectOption[] = [],
    journeyToOptions: SelectOption[] = [],
    tripDestinationOptionsMap: Record<string, SelectOption[]> = {}
  ): SelectOption[] {
    const all = [...journeyFromOptions, ...journeyToOptions]
    for (const options of Object.values(tripDestinationOptionsMap)) {
      all.push(...options)
    }
    return all
  },

  /**
   * Get Destination From dropdown options for a given trip index
   */
  getDestinationFromOptions(
    tripIndex: number,
    journeyFromOptions: SelectOption[] = [],
    allProvinceOptions: SelectOption[] = []
  ): SelectOption[] {
    if (tripIndex === 0) {
      return journeyFromOptions
    }
    return allProvinceOptions
  },

  /**
   * Get Going To dropdown options for a given trip index
   */
  getGoingToOptions(
    tripIndex: number,
    trip?: Trip,
    journeyToOptions: SelectOption[] = [],
    allProvinceOptions: SelectOption[] = [],
    tripDestinationOptionsMap: Record<string, SelectOption[]> = {},
    vehicleModelId?: number,
    journeyType?: number,
    fetchCallback?: (fromProvinceId: number) => void
  ): SelectOption[] {
    if (tripIndex === 0) {
      return journeyToOptions
    }
    if (!trip || !trip.destinationFrom) return []
    const fromId = this.resolveProvinceId(trip.destinationFrom, allProvinceOptions)
    if (!fromId) return []
    const key = `${fromId}_${vehicleModelId ?? ''}_${journeyType ?? 1}`
    if (fetchCallback) {
      fetchCallback(fromId)
    }
    return tripDestinationOptionsMap[key] || []
  },

  /**
   * Auto-select nationality option with id 1 if not already selected
   */
  autoSelectDefaultNationality(
    nationalityOptions: SelectOption[] = [],
    currentNationality?: string | null
  ): string | null {
    if (!currentNationality && Array.isArray(nationalityOptions) && nationalityOptions.length > 0) {
      const defaultOpt = nationalityOptions.find((opt) => Number(opt.id) === 1) || nationalityOptions[0]
      if (defaultOpt) {
        return String(defaultOpt.value)
      }
    }
    return currentNationality || null
  },

  /**
   * Resolve vehicle model ID from vehicle detail API response data or fallback ID
   */
  resolveVehicleModelId(detailData?: any, fallbackId?: string | number): number | undefined {
    if (detailData) {
      const rawId = detailData.modelId ?? detailData.id ?? fallbackId
      const parsedId = Number(rawId)
      return rawId != null && rawId !== '' && !isNaN(parsedId) ? parsedId : undefined
    }
    const fallbackParsed = Number(fallbackId)
    return fallbackId != null && fallbackId !== '' && !isNaN(fallbackParsed) ? fallbackParsed : undefined
  },

  /**
   * Resolve initial origin province ID from trips array or city options
   */
  resolveInitialFromProvinceId(trips: Trip[] = [], cityOptions: SelectOption[] = []): number {
    const firstFrom = trips[0]?.destinationFrom
    const resolved = this.resolveProvinceId(firstFrom, cityOptions)
    if (resolved && resolved > 0) return resolved
    if (cityOptions[0]?.id != null) {
      const optId = Number(cityOptions[0].id)
      if (!isNaN(optId) && optId > 0) return optId
    }
    return 1
  },

  /**
   * Map raw sub-location API items into standard SelectOption objects
   */
  mapSubLocationItemsToOptions(items: any[] = []): SelectOption[] {
    if (!Array.isArray(items)) return []
    return items.map((item: any) => ({
      label: item.name || item.nameEn || item.nameKh || String(item.id),
      value: item.id,
      id: item.id,
      provinceId: item.provinceId ?? item.parentProvinceId ?? item.province_id,
      amount:
        item.defaultPrice !== undefined && item.defaultPrice !== null
          ? String(item.defaultPrice)
          : item.price !== undefined && item.price !== null
          ? String(item.price)
          : undefined,
    }))
  },

  /**
   * Map raw destination province API items into standard SelectOption objects with pricing
   */
  mapDestinationItemsToOptions(items: any[] = []): SelectOption[] {
    if (!Array.isArray(items)) return []
    return items.map((item: any) => ({
      label: item.name || item.provinceName || item.nameEn || String(item.id),
      value: item.name || item.provinceName || String(item.id),
      id: item.id,
      price:
        item.price !== undefined && item.price !== null
          ? Number(item.price)
          : item.defaultPrice !== undefined && item.defaultPrice !== null
          ? Number(item.defaultPrice)
          : item.amount !== undefined && item.amount !== null
          ? Number(item.amount)
          : undefined,
    }))
  },
}
