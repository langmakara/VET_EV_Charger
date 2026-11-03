import { computed, unref, type MaybeRef } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { promotionApi } from '~/api/modules/promotion.api'
import { useApi } from '~/composables/useApi'
import { queryKeys } from './keys'
import type { PromotionCalculateParams } from '~/api/types'

export const useCalculatePromotionMutation = (options?: Record<string, any>) => {
  const http = useApi()
  const api = promotionApi(http)

  return useMutation({
    mutationFn: (params: PromotionCalculateParams) => api.calculatePromotion(params),
    ...options
  })
}

export const useCalculatePromotionQuery = (
  params: MaybeRef<PromotionCalculateParams | undefined | null>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi()
  const api = promotionApi(http)

  return useQuery({
    queryKey: computed(() => queryKeys.promotion.calculate(unref(params) || {})),
    queryFn: () => {
      const p = unref(params)
      if (!p) throw new Error('Params required')
      return api.calculatePromotion(p)
    },
    enabled: computed(() => {
      const p = unref(params)
      const isEnabled = options?.enabled !== undefined ? unref(options.enabled) : true
      return !!p?.chargerUserName && isEnabled
    })
  })
}

