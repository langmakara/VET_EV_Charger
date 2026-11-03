import type { AxiosInstance } from 'axios'
import type { ApiResponseWrapper, PromotionCalculateData, PromotionCalculateParams } from '../types'

export const promotionApi = (http: AxiosInstance) => ({
  /**
   * Calculate the discount for a charging session
   * Combines active promotions and membership level discount, voucher, and point redemption.
   * POST /promotion/calculate
   */
  calculatePromotion: (params: PromotionCalculateParams) =>
    http
      .post<ApiResponseWrapper<PromotionCalculateData>>('/promotion/calculate', params)
      .then((r) => r.data)
})

export const PromotionApi = promotionApi
