/**
 * Centralized API contract type definitions.
 * All API response shapes, request payloads, and shared data interfaces
 * live here to keep components and repositories fully type-safe.
 */

// ─── Generic API Response Wrapper ───────────────────────────────────────────

export interface ApiResponseWrapper<T> {
  success: boolean
  status: number
  code?: number
  message: string
  data: T
  timestamp: string
}

// ─── Vehicle Rental: Raw API Item (from backend) ───────────────────────────

export interface RawRentalTypeItem {
  id?: string | number
  categoryId?: number
  categoryNameKh?: string
  categoryNameEn?: string
  categoryNameZh?: string
  nameKh?: string
  nameEn?: string
  nameZh?: string
  googleMapUrl?: string
  descriptionKh?: string
  descriptionEn?: string
  descriptionZh?: string
  fileName?: string
  fileUrl?: string
  sortOrder?: number
  created?: string
  createdBy?: string
  [key: string]: any
}

// ─── Rental Services: Raw API Item (from backend) ──────────────────────────

export interface RawRentalServiceItem {
  id?: number | string
  nameKh?: string
  nameEn?: string
  nameZh?: string | null
  descriptionKh?: string
  descriptionEn?: string
  descriptionZh?: string | null
  fileName?: string
  fileUrl?: string
  sortOrder?: number
  created?: string
  createdBy?: string
  modified?: string | null
  modifiedBy?: string | null
  [key: string]: any
}

export interface RawVehicleCategory {
  id?: number
  nameKh?: string
  nameEn?: string
  nameZh?: string | null
}

export interface RawVehicleRentalType {
  id?: number
  categoryId?: number
  nameKh?: string
  nameEn?: string
  nameZh?: string | null
}

export interface RawVehicleItem {
  id?: number | string
  brandId?: number
  brandName?: string
  modelId?: number
  modelName?: string
  nameKh?: string
  nameEn?: string
  nameZh?: string | null
  vehicleCode?: string
  plateNumber?: string
  fileName?: string
  fileUrl?: string
  quantity?: number
  isPublic?: number
  categories?: RawVehicleCategory[]
  rentalTypes?: RawVehicleRentalType[]
  created?: string
  createdBy?: string
  modified?: string
  modifiedBy?: string
  capacity?: number
  price?: number | string
  averageRating?: number
  totalReviews?: number
  descriptionKh?: string
  descriptionEn?: string
  description?: string
  facilities?: any[]
  [key: string]: any
}

export interface PaginatedVehicleData {
  data: RawVehicleItem[]
  total: number
}

export interface VehicleListParams {
  page?: number
  size?: number
  keyword?: string
  sortBy?: string
  brandId?: number
  modelId?: number
  categoryId?: number
  rentalTypeId?: number | string
  guests?: number
  rating?: number
  [key: string]: any
}

// ─── Vehicle Detail & Reviews ───────────────────────────────────────────────

export interface RawVehicleSlideItem {
  id?: string | number
  fileName?: string
  fileUrl?: string
  sortOrder?: number
}

export interface RawVehicleFacilityItem {
  id?: string | number
  facilityId?: string | number
  facilityNameKh?: string
  facilityNameEn?: string
  facilityNameZh?: string | null
  qty?: number
  icon?: string
  nameEn?: string
  nameKh?: string
  label?: string
}

export interface RawVehicleItemUnit {
  id?: string | number
  code?: string
  plateNumber?: string
  status?: number
  created?: string
  modified?: string | null
}

export interface RawRatingBreakdownItem {
  star?: number
  label?: string
  percent?: number
  count?: number
}

export interface RawVehicleDetailData {
  id?: string | number
  brandId?: number
  brandName?: string
  modelId?: number
  modelName?: string
  nameKh?: string
  nameEn?: string
  nameZh?: string | null
  vehicleCode?: string
  plateNumber?: string
  fileName?: string
  fileUrl?: string
  quantity?: number
  passengers?: number
  averageRating?: number
  totalReviews?: number
  ratingBreakdown?: Record<string, number> | RawRatingBreakdownItem[]
  categories?: RawVehicleCategory[]
  rentalTypes?: RawVehicleRentalType[]
  slides?: RawVehicleSlideItem[] | string[]
  facilities?: RawVehicleFacilityItem[]
  items?: RawVehicleItemUnit[]
  recentReviews?: RawVehicleReviewItem[]
  capacity?: number
  price?: number | string
  rating?: number
  descriptionKh?: string
  descriptionEn?: string
  description?: string
  images?: string[]
  [key: string]: any
}

export interface VehicleReviewsParams {
  page?: number
  size?: number
  keyword?: string
  sortBy?: string
  dateFrom?: string
  dateTo?: string
  customerId?: number
  vehicleId?: number
  salesOrderId?: number
  [key: string]: any
}

export interface RawVehicleReviewItem {
  id?: number
  customerId?: number
  customerName?: string | null
  customerPhone?: string | null
  salesOrderId?: number
  orderNo?: string
  vehicleId?: number
  vehicleName?: string
  ratingStars?: number
  comment?: string
  isDisabled?: number
  created?: string
}

export interface VehicleReviewsData {
  items?: RawVehicleReviewItem[]
  list?: RawVehicleReviewItem[]
  total?: number
  page?: number
  size?: number
}

// ─── Vehicle Schedule ──────────────────────────────────────────────────────

export interface VehicleTimeSlot {
  time: string
  isBusy?: boolean
  isDisabled?: boolean
}

export interface VehicleScheduleData {
  vehicleId: number
  monthYear?: string
  availableDates?: string[]
  unavailableDates?: string[]
  timeSlots?: VehicleTimeSlot[]
}

// ─── Filter Options ────────────────────────────────────────────────────────

export interface FilterCategoryItem {
  id: number | string
  name: string
}

export interface FilterRentalTypeItem {
  id: number | string
  name: string
}

export interface FilterOptionsData {
  passengers?: number[]
  ratings?: number[]
  categories?: FilterCategoryItem[]
  rentalTypes?: FilterRentalTypeItem[]
  brands?: any[]
}

// ─── Booking State ─────────────────────────────────────────────────────────

export interface TripStop {
  id: number
  value: string
}

export interface Trip {
  id: number
  destinationFrom: string
  goingTo: string
  stops: TripStop[]
}

// ─── User Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id?: number
  employeeId?: number | null
  username?: string
  fullName?: string
  firstName?: string | null
  lastName?: string | null
  photo?: string | null
  signature?: string | null
  roles?: any[]
  isActive?: number
  created?: string | null
  createdBy?: string | null
  modified?: string | null
  modifiedBy?: string | null
  moduleTypeList?: any[]
  [key: string]: any
}

