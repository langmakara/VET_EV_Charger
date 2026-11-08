import { ref } from 'vue'
import { useAbaAuthTokenMutation } from '~/composables/queries/useAba'
import { useAuthToken } from '~/composables/useAuthToken'
import type { AbaAuthTokenParams, AbaAuthTokenData, ApiResponseWrapper } from '~/api/types'

// Shared state for auth response and token across components
const sharedAuthResponse = ref<ApiResponseWrapper<AbaAuthTokenData> | null>(null)
const sharedAuthToken = ref<string | null>(null)

export const getAbaAuthToken = (): string | null => {
  return sharedAuthToken.value
}

export const useSendProfile = (options?: Record<string, any>) => {
  const authTokenMutation = useAbaAuthTokenMutation(options)
  const { setToken, getToken } = useAuthToken()
  const authResponse = sharedAuthResponse
  const authToken = sharedAuthToken

  /**
   * Sends all profile data received from mobile app to useAbaAuthTokenMutation.
   * On success, extracts and persists the returned access token.
   */
  const sendProfile = async (
    profileData: AbaAuthTokenParams
  ): Promise<ApiResponseWrapper<AbaAuthTokenData>> => {
    const response = await authTokenMutation.mutateAsync(profileData)
    authResponse.value = response

    const token =
      response?.data?.token ||
      response?.data?.accessToken ||
      response?.data?.access_token ||
      response?.body?.data?.token ||
      response?.body?.data?.accessToken ||
      response?.body?.data?.access_token ||
      (typeof response?.data === 'string' ? response.data : undefined)

    if (token) {
      sharedAuthToken.value = token
      setToken(token)
    }

    return response
  }

  return {
    ...authTokenMutation,
    authResponse,
    authToken,
    sendProfile,
    getAuthToken: () => sharedAuthToken.value || getToken()
  }
}

export default useSendProfile

