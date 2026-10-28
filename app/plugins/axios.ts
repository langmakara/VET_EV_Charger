import { createApiClient } from "~/api/client";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = (config.public.apiBase as string) || "";

  const tokenCookie = useCookie<string | null>("access_token", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const getToken = (): string | null => {
    if (tokenCookie.value) return tokenCookie.value;

    if (import.meta.client) {
      try {
        const local = localStorage.getItem("access_token");
        if (local) {
          tokenCookie.value = local;
          return local;
        }
      } catch {}

      const win = window as any;
      if (win?.pendingMobileToken) {
        tokenCookie.value = win.pendingMobileToken;
        return win.pendingMobileToken;
      }
    }
    return null;
  };

  const onUnauthorized = () => {
    tokenCookie.value = null;
    if (import.meta.client) {
      try {
        localStorage.removeItem("access_token");
        delete (window as any).pendingMobileToken;
      } catch {}
    }
  };

  const api = createApiClient(apiBase, getToken, onUnauthorized);

  return {
    provide: {
      api,
    },
  };
});
