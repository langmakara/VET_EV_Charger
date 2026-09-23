/**
 * Composable for managing auth token storage.
 * Uses Nuxt `useCookie` as the single source of truth for both SSR and Client,
 * with localStorage sync for client-side operations.
 */
export const useAuthToken = () => {
  const cookieToken = useCookie<string | null>("access_token", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const setToken = (token: string) => {
    if (!token) return;
    cookieToken.value = token;
    if (import.meta.client) {
      try {
        localStorage.setItem("access_token", token);
      } catch (e) {}
    }
  };

  const getToken = (): string | null => {
    if (cookieToken.value) return cookieToken.value;

    if (import.meta.client) {
      // 1. Try localStorage
      try {
        const localToken = localStorage.getItem("access_token");
        if (localToken) {
          cookieToken.value = localToken;
          return localToken;
        }
      } catch (e) {}

      // 2. Try window.pendingMobileToken set by Flutter native bridge
      const win = window as any;
      if (win?.pendingMobileToken) {
        setToken(win.pendingMobileToken);
        return win.pendingMobileToken;
      }

      // 3. Try URL query parameters (?token=... or ?access_token=... or ?accessToken=...)
      if (win?.location?.search) {
        try {
          const params = new URLSearchParams(win.location.search);
          const urlToken =
            params.get("token") ||
            params.get("access_token") ||
            params.get("accessToken") ||
            params.get("auth_token") ||
            params.get("bearer");
          if (urlToken) {
            setToken(urlToken);
            return urlToken;
          }
        } catch (e) {}
      }
    }
    return null;
  };

  const removeToken = () => {
    cookieToken.value = null;
    if (import.meta.client) {
      try {
        localStorage.removeItem("access_token");
        delete (window as any).pendingMobileToken;
      } catch (e) {}
    }
  };

  return {
    getToken,
    setToken,
    removeToken,
  };
};

