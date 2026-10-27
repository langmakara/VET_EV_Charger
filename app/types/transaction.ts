export interface HistoryDetailItem {
  id?: number | string
  transactionId?: string | number
  stationName?: string
  title?: string
  orderDate?: string
  datetime?: string
  dateGroup?: string
  type?: 'spend' | 'earned' | 'transaction' | 'session' | string
  mode?: 'transaction' | 'session'

  // Transaction Detail fields (Image 1)
  subTotal?: string | number
  discount?: string | number
  discountPercent?: string | number
  totalAmount?: string | number
  totalKwh?: string | number
  points?: number
  pointSpend?: string | number

  // Session Detail fields (Image 2)
  timeElapsed?: string
  energy?: string
  preAuthorisedAmount?: string | number
  finalChargingCost?: string | number
}

export type TransactionDetailItem = HistoryDetailItem
