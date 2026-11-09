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
  body?: ApiResponseBody<T> | T | any;
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

// POST /station/price-per-kwh
export interface StationPricePerKwhParams {
  chargerUserName: string;
  plugId?: number;
  [key: string]: any;
}

export interface StationPricePerKwhData {
  stationId: number;
  pricePerKwh: number;
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

// Type of voucher list
export interface VoucherDate {
  id?: number | string;
  voucherId?: number;
  voucherCode?: string;
  voucherBatchId?: number;
  batchTitle?: string;
  banner?: string;
  bannerName?: string;
  discountType?: number;
  discountValue?: number;
  expiresDate?: string;
  displayStatus?: number;
  statusText?: string;
  isApplied?: number;
  [key: string]: any;
}

export interface VoucherListParams {
  page?: number;
  rowsPerPage?: number;
  [key: string]: any;
}

export interface VoucherSearchParams {
  code?: string;
  [key: string]: any;
}

export type VoucherApplyParams = VoucherSearchParams;

// dropdown parameter
export interface DropdownParams {
  page?: number;
  rowsPerPage?: number;
  searchText?: string;
  chargerUserName?: string;
  [key: string]: any;
}

export interface NewFeedData {
  id?: number | string;
  titleKh?: string;
  titleEn?: string;
  titleZh?: string;
  feedUrl?: string;
  profileUrl?: string;
  descriptionKh?: string;
  descriptionEn?: string;
  descriptionZh?: string;
  created?: string;
  [key: string]: any;
}

// Charging Status
export interface ChargingStatusData {
  isCharging: number; // 1 = charging, 0 = not charging
  estTime: string;
  battery: string;
  [key: string]: any;
}

// membership

export interface PerkItem {
  description: string;
  subItems?: string[];
}

export interface MembershipData {
  id: number;
  name: string;
  requirePoint: number;
  expireDuration: number;
  description: string;
  discount: number;
  pointMultiplier: number;
  redeemPoint: number;
  isYouAreHere: boolean | number;
  perks?: PerkItem[];
  [key: string]: any;
}

export interface MembershipInfoData {
  id: number;
  cardId: string;
  membershipLevelId: number;
  membershipLevelName: string;
  currentPoint: number;
  historyPoint: number;
  requirePoint: number;
  currentLevelRequirePoint: number;
  expireDuration: number;
  expiringPoint: number;
  expiringKwh: number;
  expiringInDays: number;
  [key: string]: any;
}

export interface ChargeHistoryTransaction {
  id: number;
  type: number;
  typeName: string;
  points: number;
  kwh: number;
  currentPoint: number;
  finalPoint: number;
  description: string;
  salesOrderId: number;
  created: string;
  [key: string]: any;
}

export interface ChargeHistoryData {
  date: string;
  transactions: ChargeHistoryTransaction[];
  [key: string]: any;
}

export interface ChargeHistoryParams {
  page?: number;
  rowsPerPage?: number;
  type?: number;
  [key: string]: any;
}

export interface TransactionDetailData {
  transactionId?: string;
  stationName?: string;
  orderDate?: string;
  subTotal?: number;
  discountAmount?: number;
  discountPercent?: number;
  totalAmount?: string;
  totalKwh?: number;
  pointSpend?: number;
  [key: string]: any;
}

// transaction history
export interface TransactionHistory {
  id: number;
  type: number;
  transactionId: string;
  code: string;
  amount: number;
  description: string;
  createdDate: string;
  [key: string]: any;
}

export interface TransactionHistoryData {
  date: string;
  transactions: TransactionHistory[];
  [key: string]: any;
}

export interface WalletTransactionData {
  totalBalance?: number;
  groups: TransactionHistoryData[];
  [key: string]: any;
}

export interface SaleOrderDetailData {
  id: number;
  type: number;
  orderDate: string;
  isFullCharge?: number;
  stationId?: number;
  stationName?: string;
  chargerId?: number;
  chargerName?: string;
  soCode?: string;
  transactionId?: string;
  paymentStatus?: number;
  orderStatus?: number;
  totalKwh?: number;
  totalPrice?: number;
  totalAmount?: number;
  totalReturnAmount?: number;
  chargeAmount?: number;
  paymentMethod?: number;
  paymentMethodName?: string;
  bankName?: string;
  qrString?: string;
  subTotal?: number;
  discount?: number;
  discountPercent?: number | string;
  pointSpend?: number;
  points?: number;
  timeElapsed?: string;
  energy?: string;
  preAuthorisedAmount?: number;
  finalChargingCost?: number;
  [key: string]: any;
}

// dropdown/gun/list
export interface GunTypeData {
  gunId: number;
  gunName: string;
  isAvailable: boolean;
  [key: string]: any;
}

// POST /dropdown/privacy-policy/list
export interface PrivacyPolicyDropdownData {
  id?: number | string;
  descriptionKh?: string;
  descriptionEn?: string;
  descriptionCh?: string;
  [key: string]: any;
}

// POST /dropdown/faqs/list
export interface FaqsDropdownData {
  id?: number | string;
  questionEn?: string;
  questionKh?: string;
  questionCh?: string;
  answerEn?: string;
  answerKh?: string;
  answerCh?: string;
  [key: string]: any;
}

// POST /dropdown/contact-us/list
// TypeContacUs: 1: Text, 2: Telephone, 3: Email, 4: Website
export interface ContactUsDropdownData {
  id?: number | string;
  nameKh?: string;
  nameEn?: string;
  nameCn?: string;
  typeOfContactId?: number;
  link?: string;
  iconUrl?: string;
  ordering?: number;
  [key: string]: any;
}

// POST /sale-order/app-tmp
export interface CreateSaleOrderAppTmpParams {
  chargerUsername: string;
  plugId: number;
  paymentMethod: number;
  discountPercentage?: number;
  discount?: number;
  voucherId?: number;
  membershipRedeemId?: number;
  totalKwh: number;
  totalPrice: number;
  grandTotalPrice: number;
  [key: string]: any;
}

export interface SaleOrderAppTmpData {
  transactionId?: string;
  station?: string;
  stationId?: number;
  stationName?: string;
  chargerId?: number;
  orderDate?: string;
  subTotal?: number;
  discount?: number;
  discountPercentage?: number;
  totalAmount?: number;
  totalKwh?: number;
  [key: string]: any;
}

// POST /promotion/calculate
export interface PromotionCalculateParams {
  chargerUserName: string;
  voucherId?: number;
  redeemId?: number;
  amountKh?: number;
  plugId?: number;
  [key: string]: any;
}

export interface PromotionCalculateData {
  discountPercentage?: number;
  discountAmountUsd?: number;
  discountAmountKhr?: number;
  [key: string]: any;
}

// POST /label/kwh/list & /label/price/list
export interface LabelData {
  id: number;
  name: string;
  description?: string;
  value: number;
  isFullCharge: number;
  [key: string]: any;
}

// POST /label/point/list
export interface LabelPointData {
  id: number;
  name: string;
  description?: string;
  point: number;
  [key: string]: any;
}

// POST /aba-mini-app/payment/hash
export interface AbaPaymentHashParams {
  account?: string;
  amount: number | string;
  currency?: 'KHR' | 'USD';
  [key: string]: any;
}

export interface AbaPaymentHashData {
  hash?: string;
  amount?: string;
  account?: string;
  currency?: string;
  [key: string]: any;
}

// POST /aba-mini-app/auth/token
export interface AbaAuthTokenParams {
  addrCode?: string;
  address?: string;
  appId?: number | string;
  appVersion?: string;
  city?: string;
  country?: string;
  dobFull?: string;
  dobShort?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  fullProfile?: boolean;
  id?: number | string;
  lang?: string;
  lastName?: string;
  middleName?: string;
  nationality?: string;
  nidDoc?: string;
  nidExpiryDate?: string;
  nidNumber?: string;
  nidType?: string;
  occupation?: string;
  osVersion?: string;
  phone?: string;
  secret_key?: string;
  sex?: string;
  [key: string]: any;
}

export interface AbaAuthTokenData {
  accessToken?: string;
  tokenType?: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  clientId?: string;
  customerId?: number | string;
  customerName?: string;
  phoneNumber?: string;
  newCustomer?: boolean;
  newAbaUser?: boolean;
  token?: string;
  access_token?: string;
  user?: any;
  [key: string]: any;
}




