import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "./types";

export interface CreateApiClientOptions {
  baseURL: string;
  getToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
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
  onUnauthorized?: () => void,
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const rawToken = getToken ? getToken() : undefined;
    if (rawToken) {
      const cleanToken = rawToken.replace(/^Bearer\s+/i, "");
      if (config.headers.set) {
        config.headers.set("Authorization", `Bearer ${cleanToken}`);
      } else {
        config.headers["Authorization"] = `Bearer ${cleanToken}`;
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status ?? 500;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.body?.message ||
        error?.message ||
        "An unexpected error occurred";

      if (status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        }
      }

      const normalizedError: ApiError = {
        status,
        message,
      };

      // Assign normalized properties onto error object for backwards/standard compatibility
      return Promise.reject(Object.assign(error, normalizedError));
    },
  );

  return instance;
};
