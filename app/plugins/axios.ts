import { createApiClient } from "~/api/client";
import { getAbaAuthToken } from "~/composables/useSendProfile";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = (config.public.apiBase as string) || "";

  const getToken = (): string | null => {
    // Token is retrieved exclusively from useAbaAuthTokenMutation
    return getAbaAuthToken();
  };

  const onUnauthorized = () => {
    // Handle session expiry if needed
  };

  const api = createApiClient(apiBase, getToken, onUnauthorized);

  return {
    provide: {
      api,
    },
  };
});
