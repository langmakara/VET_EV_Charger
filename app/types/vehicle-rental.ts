import type { RawRatingBreakdownItem, RawVehicleFacilityItem } from "./api"

export interface RentalType {
  id: string
  title: string
  titleEn?: string
  titleKh?: string
  titleZh?: string
  description: string
  descriptionEn?: string
  descriptionKh?: string
  descriptionZh?: string
  location: string
  locationEn?: string
  locationKh?: string
  locationZh?: string
  icon: string
  route: string
  rawItem?: any
}

export interface VehicleFacility {
  icon: string
  label: string
}

export interface Review {
  author: string
  avatar: string
  rating: number
  date: string
  comment: string
}

export interface RatingBreakdownItem {
  star?: number
  label?: string
  percent?: number
  count?: number
}

export interface Vehicle {
  id: string
  name: string
  nameEn?: string
  nameKh?: string
  nameZh?: string
  image: string
  images?: string[]
  rating: number
  passengers: number
  price?: string
  totalReviews?: number | string
  description?: string
  descriptionEn?: string
  descriptionKh?: string
  descriptionZh?: string
  facilities?: (VehicleFacility | RawVehicleFacilityItem)[]
  reviews?: Review[] | any
  ratingBreakdown?: RatingBreakdownItem[] | RawRatingBreakdownItem[] | Record<string, number> | any
  rawItem?: any
}


