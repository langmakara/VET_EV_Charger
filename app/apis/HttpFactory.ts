/**
 * HttpFactory
 *
 * Typed accessor for the axios instance provided by `plugins/axios.client.ts`.
 * Every repository (`~/apis/*.repository.ts`) goes through this instead of
 * calling `useFetch` / `$fetch` directly, so there is exactly one place that
 * owns the base URL, auth header, and language header logic.
 *
 * Repositories built on top of this return plain Promises (unwrapped
 * `ApiResponseWrapper<T>` payloads), which is what TanStack Query's
 * `queryFn` / `mutationFn` expect — no `useFetch`-style reactive refs here.
 */
import type { AxiosInstance } from "axios";

export const useApi = (): AxiosInstance => {
  const { $api } = useNuxtApp();
  return $api as AxiosInstance;
};
