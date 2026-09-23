/**
 * Booking API type definitions.
 * Defines the request payload and response shapes for the booking endpoint.
 */

// ─── Booking Trip ──────────────────────────────────────────────────────────

export interface BookingSubLocationPayload {
  subLocationId: number
  price: number | string
  sortOrder: number
}

export interface BookingTripPayload {
  fromProvinceId: number
  toProvinceId: number
  subLocations?: BookingSubLocationPayload[]
  price: number | string
  sortOrder: number
  status: number
}

// ─── Create Booking Request ────────────────────────────────────────────────

export interface CreateBookingPayload {
  customerId?: number
  vehicleId: number
  passengerName: string
  passengerPhone: string
  passengerNationalityId?: number
  amountOfPeople?: number
  amountOfVehicles?: number
  remark?: string
  vehicleCategoryId?: number
  vehicleRentalTypeId?: number
  journeyType?: number
  startDate: string
  endDate: string
  pickupLocationId?: number
  pickupAddress?: string
  pickupLatitude?: number
  pickupLongitude?: number
  pickupTime?: string
  dropoffLocationId?: number
  dropoffAddress?: string
  dropoffLatitude?: number
  dropoffLongitude?: number
  dropoffTime?: string | null
  subtotalAmount: number | string
  serviceFee: number | string
  taxAmount: number | string
  totalAmount: number | string
  paymentMethod?: number
  currency?: string
  receiptFileName?: string
  receiptFileUrl?: string
  receiptDescription?: string
  trips: BookingTripPayload[]
}

// ─── Create Booking Response ───────────────────────────────────────────────

export interface CreateBookingResponse {
  id?: number
  bookingCode?: string
  transactionId?: string
  qrString?: string
  totalAmount?: number
  currency?: string
  paymentStatus?: number
  paymentStatusLabel?: string
  abapay_deeplink?: string
  checkout_qr_url?: string
  [key: string]: any
}

// ─── Payment Status Check Response ─────────────────────────────────────────

export interface PaymentStatusResponse {
  paymentStatus: number
  paymentStatusLabel: string
  [key: string]: any
}
