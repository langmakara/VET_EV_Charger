import type { CreateBookingPayload, BookingTripPayload, BookingSubLocationPayload } from '~/types/booking'
import type { Trip } from '~/types/api'
import { formatDateForApi, formatIsoDateTime, formatNumber } from '~/utils/formatters'
import { tripService } from '~/services/trip.service'

export interface BuildBookingPayloadParams {
  customerId?: number
  vehicleId: string | number
  vehicleBasePrice: number | string
  username?: string | null
  phoneNumber?: string | number | null
  nationality?: string | number | null
  amountOfPeople?: number | string | null
  carAmount?: number | string | null
  remark?: string | null
  selectedType?: string | number | null
  startDateISO?: string | Date | null
  endDateISO?: string | Date | null
  pickupLocation?: string | null
  pickupCoords?: { lat: number; lng: number } | null
  startTime?: string | null
  dropoffLocation?: string | null
  dropoffCoords?: { lat: number; lng: number } | null
  endTime?: string | null
  trips: Trip[]
  cityOptions?: any[]
  journeyToOptions?: any[]
  downOptions?: any[]
  routeSubLocationsMap?: Record<string, any[]>
  nationalityOptions?: any[]
  subtotalAmount?: number
  serviceFeeTotal?: number
  overallTotalAmount?: number
  currency?: string
  vehicleCategoryId?: number | string | null
  vehicleRentalTypeId?: number | string | null
  paymentMethod?: number
}

export interface PricingBreakdown {
  subtotal: number
  serviceFee: number
  tax: number
  total: number
  currency: string
  formattedSubtotal: string
  formattedServiceFee: string
  formattedTax: string
  formattedTotal: string
}

export const bookingService = {
  /**
   * Safely parse price inputs (including formatted strings like "$150.00", "1,500.00 USD") into valid numbers
   */
  parsePriceNumber(val?: string | number | null): number {
    if (val == null || val === '') return 0
    if (typeof val === 'number') {
      return isNaN(val) ? 0 : Number(val.toFixed(2))
    }
    const cleanStr = String(val).replace(/[^0-9.-]/g, '')
    if (!cleanStr || isNaN(Number(cleanStr))) return 0
    const num = parseFloat(cleanStr)
    return isNaN(num) ? 0 : Number(num.toFixed(2))
  },

  /**
   * Parse price input into 2-decimal string representation (e.g. "40.00", "150.23")
   * without thousand separator commas.
   */
  parsePriceDecimal(val?: string | number | null): string {
    const num = this.parsePriceNumber(val)
    return num.toFixed(2)
  },

  /**
   * Convert currency between USD and KHR
   */
  convertCurrency(
    amount: number | string | null,
    
    fromCurrency: string = 'USD',
    toCurrency: string = 'KHR',
    exchangeRate: number = 4100
  ): number {
    const numericAmount = this.parsePriceNumber(amount)
    const from = fromCurrency.toUpperCase()
    const to = toCurrency.toUpperCase()

    if (from === to) return numericAmount

    let converted = numericAmount
    if (from === 'USD' && to === 'KHR') {
      converted = numericAmount * exchangeRate
      return Math.round(converted)
    }
    if (from === 'KHR' && to === 'USD') {
      converted = numericAmount / exchangeRate
      return Math.round(converted * 100) / 100
    }

    return Math.round(converted * 100) / 100
  },

  /**
   * Format currency value
   */
  formatCurrency(amount: number | string | null, currency: string = 'USD'): string {
    const numericAmount = this.parsePriceNumber(amount)
    return formatNumber(numericAmount, 'currency', { currency })
  },

  /**
   * Resolve journey type text or code to numeric enum:
   * 1 = One Way, 2 = One Day Tour, 3 = Round Trip, 4 = Multi City
   */
  resolveJourneyType(val?: string | number | null): number {
    if (typeof val === 'number') return val
    if (!val) return 1
    const num = Number(val)
    if (!isNaN(num) && num > 0) return num
    const clean = String(val).trim().toLowerCase()
    if (clean.includes('round')) return 2
    if (clean.includes('multi') || clean.includes('custom')) return 3
    return 1
  },

  /**
   * Resolve province/location ID from city options, journey-to options, or sub-location (downOptions)
   */
  resolveProvinceLocationId(
    val?: string | number | null,
    cityOptions: any[] = [],
    downOptions: any[] = [],
    journeyToOptions: any[] = []
  ): number {
    if (!val) return 0
    const cleanVal = String(val).trim()
    const numVal = Number(val)
    const isNumeric = !isNaN(numVal) && numVal > 0

    // 1. Check combined cityOptions (journeyFrom) & journeyToOptions by id, value, or label
    const combinedProvinces = [...cityOptions, ...journeyToOptions]
    const provinceOpt = combinedProvinces.find((o) => {
      if (isNumeric && Number(o.id) === numVal) return true
      return String(o.value).trim() === cleanVal || String(o.label).trim() === cleanVal
    })
    if (provinceOpt?.id != null && Number(provinceOpt.id) > 0) {
      return Number(provinceOpt.id)
    }

    // 2. Check downOptions (sub-locations) to extract parent provinceId
    const subLocOpt = downOptions.find((o) => {
      if (isNumeric && Number(o.id) === numVal) return true
      return String(o.value).trim() === cleanVal || String(o.label).trim() === cleanVal
    })
    if (subLocOpt?.provinceId != null) {
      const parentProvId = Number(subLocOpt.provinceId)
      if (!isNaN(parentProvId) && parentProvId > 0) {
        return parentProvId
      }
    }

    // 3. Fallback for numeric value if not found in options
    if (isNumeric) {
      return numVal
    }

    return 0
  },

  /**
   * Resolve nationality ID from nationality options list
   */
  resolveNationalityId(
    val?: string | number | null,
    nationalityOptions: any[] = []
  ): number | undefined {
    if (!val) return undefined
    if (typeof val === 'number') return val
    const num = Number(val)
    if (!isNaN(num) && num > 0) return num
    const cleanVal = String(val).trim()
    const opt = nationalityOptions.find(
      (o) => String(o.value).trim() === cleanVal || String(o.label).trim() === cleanVal
    )
    return opt?.id != null ? Number(opt.id) : undefined
  },

  /**
   * Calculate number of days between start and end dates (minimum 1)
   */
  calculateDaysCount(
    startDate?: string | Date | null,
    endDate?: string | Date | null
  ): number {
    if (!startDate || !endDate) return 1
    const startStr = typeof startDate === 'string' ? startDate.split('T')[0] : startDate
    const endStr = typeof endDate === 'string' ? endDate.split('T')[0] : endDate
    if (!startStr || !endStr) return 1
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1
    const diffTime = end.getTime() - start.getTime()
    if (diffTime <= 0) return 1
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays + 1)
  },

  /**
   * Resolve total route/destination price across trips from options, falling back to vehicle base price
   */
  resolveDestinationPrice(
    trips: Trip[] = [],
    journeyToOptions: any[] = [],
    cityOptions: any[] = [],
    fallbackBasePrice: number | string | null = 0
  ): number {
    const parsedFallback = this.parsePriceNumber(fallbackBasePrice)
    if (!trips || trips.length === 0) return parsedFallback

    let totalPrice = 0
    let foundCount = 0

    const combined = [...journeyToOptions, ...cityOptions]
    trips.forEach((trip) => {
      if (trip.goingTo) {
        const cleanGoingTo = String(trip.goingTo).trim()
        const opt = combined.find((o) => {
          if (o.id != null && String(o.id) === cleanGoingTo) return true
          return String(o.value).trim() === cleanGoingTo || String(o.label).trim() === cleanGoingTo
        })
        if (opt && (opt.price != null || opt.amount != null || opt.defaultPrice != null)) {
          const p = Number(opt.price ?? opt.amount ?? opt.defaultPrice)
          if (!isNaN(p) && p > 0) {
            totalPrice += p
            foundCount++
          }
        }
      }
    })

    if (foundCount > 0) {
      return Math.round(totalPrice * 100) / 100
    }

    return parsedFallback
  },

  /**
   * Calculate subtotal, service fee, tax, and overall total price with precision rounding.
   *
   * Formula rules:
   * - For City Tour type: Total Amount = price * Number of car * number of day + sublocation amount
   * - For others (One-Way, One-Day-Tour, Round-Trip, Multi-City): Total Amount = price * Number of car + sublocation amount
   */
  calculatePricing(
    basePrice: number | string | null,
    carAmountCount: number | string | null = 1,
    stopsFeeAmount?: number | string | null,
    taxRate: number = 0,
    currency: string = 'USD',
    selectedType?: string | number | null,
    startDateISO?: string | Date | null,
    endDateISO?: string | Date | null
  ): PricingBreakdown {
    const cleanBasePrice = this.parsePriceNumber(basePrice)
    const cars = Math.max(1, this.parsePriceNumber(carAmountCount) || 1)
    const serviceFee =
      stopsFeeAmount !== undefined && stopsFeeAmount !== null
        ? Math.round(this.parsePriceNumber(stopsFeeAmount) * 100) / 100
        : 0

    const journeyTypeNum = this.resolveJourneyType(selectedType)
    const isCityTour = journeyTypeNum === 5

    const days = isCityTour ? this.calculateDaysCount(startDateISO, endDateISO) : 1

    const baseTotal = cleanBasePrice * cars * days
    const subtotal = Math.round(baseTotal * 100) / 100
    const tax = Math.round((subtotal + serviceFee) * taxRate * 100) / 100
    const total = Math.round((subtotal + serviceFee + tax) * 100) / 100

    return {
      subtotal,
      serviceFee,
      tax,
      total,
      currency,
      formattedSubtotal: this.formatCurrency(subtotal, currency),
      formattedServiceFee: this.formatCurrency(serviceFee, currency),
      formattedTax: this.formatCurrency(tax, currency),
      formattedTotal: this.formatCurrency(total, currency),
    }
  },

  /**
   * Construct CreateBookingPayload matching POST /mobile/bookings API schema
   */
  buildBookingPayload(params: BuildBookingPayloadParams): CreateBookingPayload {
    const {
      customerId,
      vehicleId,
      vehicleBasePrice,
      username,
      phoneNumber,
      nationality,
      amountOfPeople,
      carAmount,
      remark,
      selectedType,
      startDateISO,
      endDateISO,
      pickupLocation,
      pickupCoords,
      startTime,
      dropoffLocation,
      dropoffCoords,
      endTime,
      trips = [],
      cityOptions = [],
      journeyToOptions = [],
      downOptions = [],
      routeSubLocationsMap = {},
      nationalityOptions = [],
      subtotalAmount,
      serviceFeeTotal,
      overallTotalAmount,
      currency = 'USD',
      vehicleCategoryId,
      vehicleRentalTypeId,
      paymentMethod,
    } = params

    const parsedVehicleId = Number(vehicleId)
    const resolvedVehicleId = !isNaN(parsedVehicleId) ? parsedVehicleId : Number(vehicleId) || 0

    const basePriceNum = this.parsePriceNumber(vehicleBasePrice)
    const totalTripsCount = Math.max(1, trips.length)

    const tripPayloads: BookingTripPayload[] = trips.map((trip, index) => {
      const fromLocId = this.resolveProvinceLocationId(trip.destinationFrom, cityOptions, downOptions, journeyToOptions)
      const toLocId = this.resolveProvinceLocationId(trip.goingTo, cityOptions, downOptions, journeyToOptions)

      // Build subLocations array for this trip
      const subLocationsPayload: BookingSubLocationPayload[] = []
      if (Array.isArray(trip.stops)) {
        trip.stops.forEach((stop) => {
          if (stop.value) {
            const option = tripService.findStopOptionForTrip(
              stop.value,
              trip,
              downOptions,
              routeSubLocationsMap,
              cityOptions
            )
            const subLocId =
              option?.id != null
                ? Number(option.id)
                : stop.value && !isNaN(Number(stop.value))
                ? Number(stop.value)
                : 0

            if (subLocId > 0) {
              const rawSubPrice =
                option && (option as any).amount != null
                  ? Number((option as any).amount)
                  : option && (option as any).price != null
                  ? Number((option as any).price)
                  : 0

              subLocationsPayload.push({
                subLocationId: subLocId,
                price: this.parsePriceDecimal(rawSubPrice),
                sortOrder: subLocationsPayload.length + 1,
              })
            }
          }
        })
      }

      // Resolve price of toProvince for this trip
      const combinedProvinces = [...journeyToOptions, ...cityOptions]
      const toOpt = combinedProvinces.find((o) => {
        if (toLocId > 0 && Number(o.id) === toLocId) return true
        return (
          String(o.value).trim() === String(trip.goingTo).trim() ||
          String(o.label).trim() === String(trip.goingTo).trim()
        )
      })

      const baseShare = basePriceNum > 0 ? basePriceNum / totalTripsCount : 0
      let toProvincePrice = 0
      if (toOpt && (toOpt.price != null || toOpt.amount != null || toOpt.defaultPrice != null)) {
        const p = Number(toOpt.price ?? toOpt.amount ?? toOpt.defaultPrice)
        if (!isNaN(p) && p > 0) {
          toProvincePrice = p
        }
      }
      if (toProvincePrice === 0) {
        toProvincePrice = baseShare
      }

      return {
        fromProvinceId: fromLocId,
        toProvinceId: toLocId,
        subLocations: subLocationsPayload,
        price: this.parsePriceDecimal(toProvincePrice),
        sortOrder: index + 1,
        status: (trip as any).status ?? 1,
      }
    })

    const startDateStr = formatDateForApi(startDateISO)
    const endDateStr = formatDateForApi(endDateISO || startDateISO)

    const resolvedPrice = this.resolveDestinationPrice(
      trips,
      journeyToOptions,
      cityOptions,
      vehicleBasePrice
    )

    const pricing = this.calculatePricing(
      resolvedPrice,
      carAmount,
      serviceFeeTotal,
      0,
      currency,
      selectedType,
      startDateISO,
      endDateISO
    )

    const cleanSubtotal = subtotalAmount !== undefined ? this.parsePriceNumber(subtotalAmount) : pricing.subtotal
    const cleanServiceFee = serviceFeeTotal !== undefined ? this.parsePriceNumber(serviceFeeTotal) : pricing.serviceFee
    const cleanTotal = overallTotalAmount !== undefined ? this.parsePriceNumber(overallTotalAmount) : pricing.total

    return {
      customerId,
      vehicleId: resolvedVehicleId,
      passengerName: username || '',
      passengerPhone: String(phoneNumber || ''),
      passengerNationalityId: this.resolveNationalityId(nationality, nationalityOptions),
      amountOfPeople: Number(amountOfPeople) || 1,
      amountOfVehicles: Number(carAmount) || 1,
      remark: remark || '',
      vehicleCategoryId: vehicleCategoryId != null && !isNaN(Number(vehicleCategoryId)) ? Number(vehicleCategoryId) : undefined,
      vehicleRentalTypeId: vehicleRentalTypeId != null && !isNaN(Number(vehicleRentalTypeId)) ? Number(vehicleRentalTypeId) : undefined,
      journeyType: this.resolveJourneyType(selectedType),
      startDate: startDateStr,
      endDate: endDateStr,
      pickupAddress: pickupLocation || '',
      pickupLatitude: pickupCoords?.lat || 0,
      pickupLongitude: pickupCoords?.lng || 0,
      pickupTime: formatIsoDateTime(startTime || undefined, startDateISO ? String(startDateISO) : undefined),
      dropoffAddress: dropoffLocation || '',
      dropoffLatitude: dropoffCoords?.lat || 0,
      dropoffLongitude: dropoffCoords?.lng || 0,
      dropoffTime: (endTime && String(endTime).trim()) ? formatIsoDateTime(endTime, (endDateISO || startDateISO) ? String(endDateISO || startDateISO) : undefined) : null,
      subtotalAmount: this.parsePriceDecimal(cleanSubtotal),
      serviceFee: this.parsePriceDecimal(cleanServiceFee),
      taxAmount: '0.00',
      totalAmount: this.parsePriceDecimal(cleanTotal),
      paymentMethod: paymentMethod !== undefined ? Number(paymentMethod) : 1,
      currency,
      receiptFileName: '',
      receiptFileUrl: '',
      receiptDescription: '',
      trips: tripPayloads,
    }
  },
}
