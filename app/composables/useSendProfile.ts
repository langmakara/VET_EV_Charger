import { ref, computed } from 'vue'
import { useAbaAuthTokenMutation } from '~/composables/queries/useAba'
import type { AbaAuthTokenParams, AbaAuthTokenData, ApiResponseWrapper } from '~/api/types'

// Shared state for auth response, request payload, token, and customer data across components
const sharedAuthResponse = ref<ApiResponseWrapper<AbaAuthTokenData> | null>(null)
const sharedAuthPayload = ref<AbaAuthTokenParams | null>(null)
const sharedAuthToken = ref<string | null>(null)
const sharedAuthCustomer = ref<AbaAuthTokenData | null>(null)
const sharedIsAuthPending = ref<boolean>(false)
const sharedAuthError = ref<any>(null)

export const getAbaAuthToken = (): string | null => {
  return sharedAuthToken.value
}

export const getAbaAuthPayload = (): AbaAuthTokenParams | null => {
  return sharedAuthPayload.value
}

export const getAbaAuthCustomer = (): AbaAuthTokenData | null => {
  return sharedAuthCustomer.value
}

export const getAbaAuthResponse = (): ApiResponseWrapper<AbaAuthTokenData> | null => {
  return sharedAuthResponse.value
}

export const getAbaAuthError = (): any => {
  return sharedAuthError.value
}

export const getIsNewAbaUser = (): boolean => {
  const customer = sharedAuthCustomer.value
  if (customer && typeof customer.newAbaUser !== 'undefined') {
    return customer.newAbaUser === true || (customer.newAbaUser as any) === 'true'
  }
  const res = sharedAuthResponse.value as any
  const body = res?.body
  if (body && typeof body.newAbaUser !== 'undefined') {
    return body.newAbaUser === true || body.newAbaUser === 'true'
  }
  const bodyData = body?.data || res?.data
  if (bodyData && typeof bodyData.newAbaUser !== 'undefined') {
    return bodyData.newAbaUser === true || bodyData.newAbaUser === 'true'
  }
  if (import.meta.client) {
    try {
      const saved = localStorage.getItem('customer_info')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.newAbaUser !== 'undefined') {
          return parsed.newAbaUser === true || parsed.newAbaUser === 'true'
        }
      }
    } catch {}
  }
  return false
}

export const useSendProfile = (options?: Record<string, any>) => {
  const authTokenMutation = useAbaAuthTokenMutation(options)
  const authResponse = sharedAuthResponse
  const authPayload = sharedAuthPayload
  const authToken = sharedAuthToken
  const authCustomer = sharedAuthCustomer
  const isAuthPending = sharedIsAuthPending
  const authError = sharedAuthError
  const isNewAbaUser = computed<boolean>(() => getIsNewAbaUser())

  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string) || ''
  const apiUrl = computed(() => {
    const base = apiBase.replace(/\/+$/, '')
    return `${base}/aba-mini-app/auth/token`
  })

  /**
   * Sends all profile data received from mobile app to useAbaAuthTokenMutation.
   * On success, extracts and persists the returned access token.
   * On error, captures the server error response so it can be inspected.
   */
  const sendProfile = async (
    profileData: AbaAuthTokenParams
  ): Promise<ApiResponseWrapper<AbaAuthTokenData>> => {
    sharedAuthPayload.value = profileData
    sharedIsAuthPending.value = true
    sharedAuthError.value = null

    try {
      const response = await authTokenMutation.mutateAsync(profileData)
      sharedAuthResponse.value = response

      const respAny = response as any
      const bodyData = (respAny?.body?.data || respAny?.body || respAny?.data || {}) as AbaAuthTokenData

      const token =
        bodyData?.accessToken ||
        bodyData?.access_token ||
        bodyData?.token ||
        respAny?.data?.token ||
        respAny?.data?.accessToken ||
        respAny?.body?.data?.token ||
        respAny?.body?.data?.accessToken ||
        (typeof respAny?.data === 'string' ? respAny.data : undefined)

      if (bodyData && (bodyData.customerId != null || bodyData.accessToken)) {
        sharedAuthCustomer.value = bodyData
        if (import.meta.client) {
          try {
            localStorage.setItem('customer_info', JSON.stringify(bodyData))
          } catch {}
        }
      }

      if (token) {
        sharedAuthToken.value = token
      }

      return response
    } catch (err: any) {
      const errorData =
        err?.response?.data ||
        err?.data || {
          status: err?.response?.status || err?.status || 500,
          message:
            err?.response?.data?.message ||
            err?.message ||
            'Failed to authenticate with /aba-mini-app/auth/token'
        }
      sharedAuthError.value = errorData
      if (err?.response?.data) {
        sharedAuthResponse.value = err.response.data
      }
      console.error('[useSendProfile] Failed to fetch auth token:', errorData)
      throw err
    } finally {
      sharedIsAuthPending.value = false
    }
  }

  return {
    ...authTokenMutation,
    authResponse,
    authPayload,
    authCustomer,
    isAuthPending,
    authError,
    apiUrl,
    authToken,
    isNewAbaUser,
    sendProfile,
    getAuthToken: () => sharedAuthToken.value,
    getAuthPayload: () => sharedAuthPayload.value,
    getAuthCustomer: () => sharedAuthCustomer.value,
    getIsNewAbaUser
  }
}

export default useSendProfile
