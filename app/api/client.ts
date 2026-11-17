import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from './types'
import { getAbaAuthToken, clearStoredAuthToken } from '~/composables/useSendProfile'

export interface CreateApiClientOptions {
  baseURL: string
  getToken?: () => string | null | undefined
  onUnauthorized?: () => void
}

/**
 * Creates and configures the centralized Axios client instance.
 *
 * Attaches auth & language headers on every request via interceptors,
 * normalizes errors to `{ status, message }`, and invokes 401 handler on session expiry.
 */
export const createApiClient = (
  baseURL: string,
  getToken?: () => string | null | undefined,
  onUnauthorized?: () => void
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000
  })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Endpoints that authenticate or exchange tokens MUST NOT include an Authorization Bearer header.
    // If an old/invalid token is sent in the header to /aba-mini-app/auth/token, the server's OAuth2 filter
    // intercepts the request and rejects it with 401 "Invalid access token" before the controller runs.
    const isAuthEndpoint =
      config.url &&
      (config.url.includes('/aba-mini-app/auth/token') ||
        config.url.includes('/auth/token'))

    if (isAuthEndpoint) {
      if (config.headers?.delete) {
        config.headers.delete('Authorization')
      } else if (config.headers) {
        delete (config.headers as any)['Authorization']
      }
      return config
    }

    // Resolve dynamic token from useAbaAuthTokenMutation (via getAbaAuthToken)
    const rawToken = getToken ? getToken() : getAbaAuthToken()

    if (rawToken) {
      const cleanToken = rawToken.replace(/^Bearer\s+/i, '')
      if (config.headers.set) {
        config.headers.set('Authorization', `Bearer ${cleanToken}`)
      } else {
        config.headers['Authorization'] = `Bearer ${cleanToken}`
      }
    }

    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status ?? 500
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.header?.errorText ||
        error?.response?.data?.body?.message ||
        error?.message ||
        'An unexpected error occurred'

      if (status === 401) {
        // Clear stale token so future requests are not poisoned
        clearStoredAuthToken()
        if (onUnauthorized) {
          onUnauthorized()
        }
      }

      const normalizedError: ApiError = {
        status,
        message
      }

      // Assign normalized properties onto error object for backwards/standard compatibility
      return Promise.reject(Object.assign(error, normalizedError))
    }
  )

  return instance
}
