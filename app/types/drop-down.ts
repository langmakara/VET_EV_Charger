/**
 * Dropdown API Type Definitions
 */


export interface SubLocationQueryParams {
  page?: number
  size?: number
  keyword?: string
  sortBy?: string
  provinceId?: number | string | null
  fromProvinceId?: number | string | null
  toProvinceId?: number | string | null
  vehicleModelId?: number | string | null
  journeyType?: number | string | null
  isPublic?: string
  [key: string]: any
}

export interface JourneyFromQueryParams {
  page?: number
  size?: number
  keyword?: string
  sortBy?: string
  vehicleModelId?: number | string | null
  journeyType?: number | string | null
  [key: string]: any
}

export interface JourneyToQueryParams {
  page?: number
  size?: number
  keyword?: string
  sortBy?: string
  fromProvinceId?: number | string | null
  vehicleModelId?: number | string | null
  journeyType?: number | string | null
  [key: string]: any
}

export type DropdownQueryParams = SubLocationQueryParams

export interface SubLocationItem {
  id: number
  provinceId: number
  provinceName?: string
  name: string
  defaultPrice?: number
  googleMapUrl?: string
  description?: string
  isPublic?: number
  created?: string
  createdBy?: string
  modified?: string | null
  modifiedBy?: string | null
  [key: string]: any
}

export interface DropdownItem {
  id: number
  name: string
  provinceId?: number
  provinceName?: string
  defaultPrice?: number
  googleMapUrl?: string
  description?: string
  isPublic?: number
  created?: string
  createdBy?: string
  modified?: string | null
  modifiedBy?: string | null
  [key: string]: any
}

export interface PaginationMeta {
  page?: number
  size?: number
  total?: number
  [key: string]: any
}

export interface SelectOption {
  label: string
  value: string | number
  id?: number | string
  provinceId?: number | string
  amount?: string
  [key: string]: any
}
