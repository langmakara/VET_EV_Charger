/**
 * Axios plugin — creates the single HTTP client instance used by every
 * repository in `~/apis/*.repository.ts`.
 *
 * Built as a Nuxt plugin (rather than a module-level `axios.create()`) so that
 * `useRuntimeConfig()` / `useApiUrl()` are guaranteed to run inside a live
 * Nuxt app context when the base URL is resolved.
 *
 * Auth + language headers are attached per-request (not baked in once) via an
 * interceptor, so a token or `lang_id` cookie change on the client is always
 * picked up on the next call without recreating the client.
 */
import axios, { type AxiosInstance } from "axios";

export default defineNuxtPlugin(() => {
  const { baseUrl } = useApiUrl();

  const api: AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 15000,
  });

  api.interceptors.request.use((config) => {
    const { getToken } = useAuthToken();
    const rawToken = getToken();
    if (rawToken) {
      const cleanToken = rawToken.replace(/^Bearer\s+/i, "");
      config.headers.set
        ? config.headers.set("Authorization", `Bearer ${cleanToken}`)
        : (config.headers["Authorization"] = `Bearer ${cleanToken}`);
    }

    const langIdCookie = useCookie<string | number | null>("lang_id", { default: () => 2 });
    const langId = String(langIdCookie.value ?? 2);
    if (config.headers.set) {
      config.headers.set("x-lang-id", langId);
      config.headers.set("lang-id", langId);
    } else {
      config.headers["x-lang-id"] = langId;
      config.headers["lang-id"] = langId;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 401 && import.meta.client) {
        const { removeToken } = useAuthToken();
        removeToken();
      }

      // Normalize a few fields so existing call sites that check
      // `err.status` / `err.statusCode` / `err.data` (the old ofetch shape)
      // keep working unchanged against axios errors.
      error.status = status;
      error.statusCode = status;
      error.data = error?.response?.data;

      return Promise.reject(error);
    },
  );

  return {
    provide: {
      api,
    },
  };
});
