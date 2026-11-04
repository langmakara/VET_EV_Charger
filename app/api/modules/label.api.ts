import type { AxiosInstance } from 'axios'
import type { ApiResponseWrapper, LabelData, LabelPointData } from '../types'

export const labelApi = (http: AxiosInstance) => ({
  /**
   * POST /label/kwh/list
   * List kWh labels
   */
  getKwhLabels: (params?: Record<string, any>) =>
    http
      .post<ApiResponseWrapper<LabelData[]>>('/label/kwh/list', params ?? {})
      .then((r) => r.data),

  /**
   * POST /label/price/list
   * List price labels
   */
  getPriceLabels: (params?: Record<string, any>) =>
    http
      .post<ApiResponseWrapper<LabelData[]>>('/label/price/list', params ?? {})
      .then((r) => r.data),

  /**
   * POST /label/point/list
   * List point labels
   */
  getPointLabels: (params?: Record<string, any>) =>
    http
      .post<ApiResponseWrapper<LabelPointData[]>>('/label/point/list', params ?? {})
      .then((r) => r.data)
})

export const getLabelApi = labelApi
