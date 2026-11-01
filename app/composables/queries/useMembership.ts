import { computed, unref, type MaybeRef } from 'vue'
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import { MembershipTierApi } from '~/api/modules/membership.api'
import { useApi } from '~/composables/useApi'
import { queryKeys } from './keys'
import type { ChargeHistoryParams } from '~/api/types'

export const useMembershipQuery = (options?: { enabled?: boolean; refetchInterval?: number }) => {
  const http = useApi()
  const api = MembershipTierApi(http)

  return useQuery({
    queryKey: queryKeys.membership.benefits(),
    queryFn: () => api.getMenbershipList(),
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000
  })
}

export const useMembershipInfoQuery = (options?: {
  enabled?: boolean
  refetchInterval?: number
}) => {
  const http = useApi()
  const api = MembershipTierApi(http)

  return useQuery({
    queryKey: queryKeys.membership.info(),
    queryFn: () => api.getMembershipInfo(),
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000
  })
}

export const useMembershipChargeHistoryQuery = (
  params?: MaybeRef<ChargeHistoryParams>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi()
  const api = MembershipTierApi(http)

  return useInfiniteQuery({
    queryKey: computed(() => {
      const raw = unref(params) || {}
      const { page, ...rest } = raw
      return queryKeys.membership.chargeHistory(rest)
    }),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.getChargeHistory({
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
      const items = Array.isArray(res) ? res : (res?.list ?? [])
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
