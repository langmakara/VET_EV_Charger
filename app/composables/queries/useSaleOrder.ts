import { computed, unref, type MaybeRef } from 'vue'
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/vue-query'
import { SaleOrderApi } from '~/api/modules/saleOrder.api'
import { useApi } from '~/composables/useApi'
import { queryKeys } from './keys'
import type {
  ApiResponseWrapper,
  ChargeHistoryParams,
  CreateSaleOrderAppTmpParams,
  SaleOrderAppTmpData,
  SaleOrderDetailData
} from '~/api/types'

export const useTransactionsHistoryQuery = (
  params?: MaybeRef<ChargeHistoryParams>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi()
  const api = SaleOrderApi(http)

  return useInfiniteQuery({
    queryKey: computed(() => {
      const raw = unref(params) || {}
      const { page, ...rest } = raw
      return queryKeys.saleOrder.transactionsHistory(rest)
    }),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.getTransactionsHistory({
        ...unref(params),
        page: pageParam as number
      }),
    enabled: computed(() => (options?.enabled !== undefined ? unref(options.enabled) : true)),
    getNextPageParam: (lastPage, allPages) => {
      const pagination =
        (lastPage as any)?.body?.pagination ??
        (lastPage as any)?.pagination ??
        (lastPage as any)?.data?.pagination

      if (pagination) {
        const currentPage = Number(pagination.page) || allPages.length
        const rowsPerPage =
          Number(pagination.rowsPerPage) ||
          Number(unref(params)?.rowsPerPage) ||
          20
        const total = Number(pagination.total) || 0

        if (currentPage * rowsPerPage < total) {
          return currentPage + 1
        }
        return undefined
      }

      const res = (lastPage as any)?.data ?? (lastPage as any)?.body?.data
      const items = Array.isArray(res) ? res : (res?.groups ?? res?.list ?? [])
      const rowsPerPage = Number(unref(params)?.rowsPerPage) || 20

      const txCount = items.reduce((sum: number, g: any) => {
        return sum + (Array.isArray(g?.transactions) ? g.transactions.length : 1)
      }, 0)

      if (txCount < rowsPerPage || txCount === 0) {
        return undefined
      }
      return allPages.length + 1
    },
    staleTime: 5 * 60 * 1000
  })
}

export const useSaleOrderDetailQuery = (
  transactionId: MaybeRef<string | undefined>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi()
  const api = SaleOrderApi(http)

  return useQuery({
    queryKey: computed(() => queryKeys.saleOrder.detail(unref(transactionId) || '')),
    queryFn: async () => {
      const id = unref(transactionId)
      if (!id) return null
      const res = await api.findSaleOrderByTransactionId(id)
      const data = (res as any)?.body?.data ?? (res as any)?.data ?? res
      if (Array.isArray(data)) {
        return (data[0] || null) as SaleOrderDetailData | null
      }
      return (data || null) as SaleOrderDetailData | null
    },
    enabled: computed(() => {
      const id = unref(transactionId)
      const isEnabled = options?.enabled !== undefined ? unref(options.enabled) : true
      return !!id && isEnabled
    }),
    staleTime: 5 * 60 * 1000
  })
}

export const useCreateSaleOrderAppTmpMutation = (options?: Record<string, any>) => {
  const http = useApi()
  const api = SaleOrderApi(http)

  return useMutation({
    mutationFn: (params: CreateSaleOrderAppTmpParams) => api.createSaleOrderAppTmp(params),
    ...options
  })
}

