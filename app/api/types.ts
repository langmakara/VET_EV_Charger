/**
 * Shared API Types
 *
 * Core response and error contracts for the Axios + TanStack Query layer.
 */

export interface ApiError {
  status: number;
  message: string;
}

export interface ApiResponseHeader {
  serverTimestamp: number;
  result: boolean;
  statusCode: number;
}

export interface ApiResponseBody<T = any> {
  status: boolean;
  message: string;
  data?: T;
}

export interface ApiResponseWrapper<T = void> {
  header?: ApiResponseHeader;
  body?: ApiResponseBody<T>;
  data?: T;
  success?: boolean;
  status?: number;
  code?: number;
  message?: string;
  timestamp?: string;
}

export interface PrivacyTermsData {
  id?: number | string;
  descriptionKh?: string;
  descriptionEn?: string;
  descriptionZh?: string;
  type?: number;
  [key: string]: any;
}

// Type of station list
export interface GunInform {
  chargerGunId: number;
  name: string;
  qty: number;
  qtyAvailable: number;
  id?: number | string;
  code?: string;
  [key: string]: any;
}

export interface StationData {
  id: number;
  code: string;
  companyId: number;
  provinceId: number;
  totalCharger: number;
  totalChargerAvailable: number;
  name: string;
  pricePerKwh: number;
  phoneNumber: string;
  description: string;
  address: string;
  imageUrl: string;
  imageName: string;
  lats: string;
  longs: string;
  value?: string;
  isFavorite: boolean;
  isOpen: boolean;
  gunInform: GunInform[];
  [key: string]: any;
}

export interface StationListParams {
  page?: number;
  rowsPerPage?: number;
  lats?: number | string;
  longs?: number | string;
  [key: string]: any;
}

// Type of station detail
export interface ChargerGunDetail {
  chargerGunId: number;
  name: string;
  maxAmperage?: number;
  pricePerKwh?: number;
  qty: number;
  qtyAvailable: number;
  [key: string]: any;
}

export interface ContactUsItem {
  id: number;
  contactTypeId: number;
  contactTypeName: string;
  contactTypeNameKh?: string;
  type: number;
  imageUrl?: string;
  imageName?: string;
  name: string;
  link: string;
  [key: string]: any;
}

export interface AmenityItem {
  id: number;
  name: string;
  nameKh?: string;
  imageUrl?: string;
  imageName?: string;
  [key: string]: any;
}

export interface SurroundingItem {
  id: number;
  name: string;
  nameKh?: string;
  imageUrl?: string;
  imageName?: string;
  [key: string]: any;
}

export interface StationDetailData {
  id: number;
  isHasCharger?: number;
  franchiseId?: number;
  franchiseName?: string;
  franchiseProfileUrl?: string;
  franchiseProfileName?: string;
  name: string;
  address?: string;
  lats?: string;
  longs?: string;
  phoneNumber?: string;
  provinceId?: number;
  provinceName?: string;
  provinceNameKh?: string;
  companyId?: number;
  companyName?: string;
  pricePerKwh?: number;
  costingPerKwh?: number;
  driverCosting?: number;
  description?: string;
  telegramId?: string;
  imageUrl?: string;
  imageName?: string;
  isShowOnApp?: number;
  bankMerchantId?: number;
  bankMerchantName?: string;
  is24Hours?: number;
  openTime?: string;
  closeTime?: string;
  openHour?: string;
  chargerGuns?: ChargerGunDetail[];
  contactUs?: ContactUsItem[];
  amenities?: AmenityItem[];
  surroundings?: SurroundingItem[];
  createdBy?: string;
  created?: string;
  modifiedBy?: string;
  modified?: string;
  [key: string]: any;
}


