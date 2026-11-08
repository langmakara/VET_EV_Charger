import type { AxiosInstance } from 'axios'
import type {
  ApiResponseWrapper,
  AbaPaymentHashParams,
  AbaPaymentHashData,
  AbaAuthTokenParams,
  AbaAuthTokenData
} from '../types'

export const abaApi = (http: AxiosInstance) => ({
  /**
   * Generate hash for ABA doPayment
   * Returns upperCase(sha256(upperCase(account + amount + currency + secretKey)))
   * with amount formatted to 2 decimals.
   * POST /aba-mini-app/payment/hash
   */
  generatePaymentHash: (params: AbaPaymentHashParams) =>
    http
      .post<ApiResponseWrapper<AbaPaymentHashData>>('/aba-mini-app/payment/hash', params)
      .then((r) => r.data),

  /**
   * Get VET token from ABA getProfile data
   * Posts the object returned by the ABA bridge handler getProfile as-is (including secret_key).
   * Server verifies secret_key with SHA-256 and returns an OAuth2 token.
   * POST /aba-mini-app/auth/token
   */
  getAuthToken: (params: AbaAuthTokenParams) =>
    http
      .post<ApiResponseWrapper<AbaAuthTokenData>>('/aba-mini-app/auth/token', params)
      .then((r) => r.data)
})

export const AbaApi = abaApi

