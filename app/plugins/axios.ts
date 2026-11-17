import { createApiClient } from "~/api/client";
import { getAbaAuthToken, clearStoredAuthToken } from "~/composables/useSendProfile";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = (config.public.apiBase as string) || "";

  const getToken = (): string | null => {
    // Token is retrieved exclusively from useAbaAuthTokenMutation
    return getAbaAuthToken();
  };

  const onUnauthorized = () => {
    clearStoredAuthToken();
  };

  const api = createApiClient(apiBase, getToken, onUnauthorized);

  return {
    provide: {
      api,
    },
  };
});
