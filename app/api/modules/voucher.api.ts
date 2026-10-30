import type { AxiosInstance } from 'axios'
import type { ApiResponseWrapper, VoucherDate, VoucherListParams, VoucherSearchParams } from '../types'

export const voucherApi = (http: AxiosInstance) => ({
  // post /voucher/list
  getInfiniteVoucher: (params?: VoucherListParams) =>
    http.post<ApiResponseWrapper<VoucherDate[]>>('/voucher/list', params).then((r) => r.data),

  // post /voucher/search
  searchVoucher: (params: VoucherSearchParams) =>
    http.post<ApiResponseWrapper<VoucherDate[]>>('/voucher/search', params).then((r) => r.data),

  // post /voucher/apply
  applyVoucher: (params: VoucherSearchParams) =>
    http.post<ApiResponseWrapper>('/voucher/apply', params).then((r) => r.data),
})
