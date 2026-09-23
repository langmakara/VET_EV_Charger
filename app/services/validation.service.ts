import type { Trip } from '~/types/api'

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface PassengerInput {
  username?: string | null
  phoneNumber?: string | number | null
  nationality?: string | number | null
  amountOfPeople?: number | string | null
}

export const validationService = {
  /**
   * Check if phone number is valid
   */
  isValidPhoneNumber(phone?: string | number | null): boolean {
    if (phone == null || phone === '') return false
    const digits = String(phone).replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15
  },

  /**
   * Validate passenger profile details
   */
  validatePassengerDetails(input: PassengerInput): ValidationResult {
    const errors: Record<string, string> = {}

    if (!input.username || !input.username.trim()) {
      errors.username = 'Passenger name is required'
    }

    if (!input.phoneNumber || !this.isValidPhoneNumber(input.phoneNumber)) {
      errors.phoneNumber = 'A valid phone number is required'
    }

    if (!input.nationality) {
      errors.nationality = 'Nationality selection is required'
    }

    if (input.amountOfPeople != null) {
      const num = Number(input.amountOfPeople)
      if (isNaN(num) || num < 1) {
        errors.amountOfPeople = 'Amount of people must be at least 1'
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
  },

  /**
   * Validate date & time selection for booking schedule
   */
  validateScheduleSelection(
    datetimeValue?: string | string[] | null,
    journeyType: number = 1
  ): ValidationResult {
    const errors: Record<string, string> = {}

    if (!datetimeValue || (Array.isArray(datetimeValue) && datetimeValue.length === 0)) {
      errors.datetime = 'Please select a rental date'
      return { valid: false, errors }
    }

    if (journeyType === 2) {
      if (!Array.isArray(datetimeValue) || datetimeValue.length < 2 || !datetimeValue[1]) {
        errors.datetime = 'Please select both departure and return dates'
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
  },

  /**
   * Validate trip routes & stops
   */
  validateTripStops(trips: Trip[] = []): ValidationResult {
    const errors: Record<string, string> = {}

    if (!trips || trips.length === 0) {
      errors.trips = 'At least one trip must be defined'
      return { valid: false, errors }
    }

    trips.forEach((trip, idx) => {
      if (!trip.destinationFrom) {
        errors[`trip_${idx}_from`] = `Departure location is required for Trip ${idx + 1}`
      }
      if (!trip.goingTo) {
        errors[`trip_${idx}_to`] = `Destination is required for Trip ${idx + 1}`
      }
    })

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
  },
}
