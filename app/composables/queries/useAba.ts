import { useMutation } from '@tanstack/vue-query'
import { abaApi } from '~/api/modules/aba.api'
import { useApi } from '~/composables/useApi'
import type { AbaPaymentHashParams, AbaAuthTokenParams } from '~/api/types'

export const useGeneratePaymentHashMutation = (options?: Record<string, any>) => {
  const http = useApi()
  const api = abaApi(http)

  return useMutation({
    mutationFn: (params: AbaPaymentHashParams) => api.generatePaymentHash(params),
    ...options
  })
}

export const useAbaAuthTokenMutation = (options?: Record<string, any>) => {
  const http = useApi()
  const api = abaApi(http)

  return useMutation({
    mutationFn: (params: AbaAuthTokenParams) => api.getAuthToken(params),
    ...options
  })
}

