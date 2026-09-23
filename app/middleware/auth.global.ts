export default defineNuxtRouteMiddleware(async (to) => {
  const { getToken, removeToken } = useAuthToken();
  const { fetchUserProfile } = useUserProfile();

  // Check if token was set via cookie (managed by server/middleware/auth.ts via HTTP Authorization Header)
  const cookieToken = useCookie("access_token");
  if (cookieToken.value && !getToken()) {
    const { setToken } = useAuthToken();
    setToken(cookieToken.value);
  }

  const rawToken = getToken();
  const isAuthenticated = !!rawToken;

  // Pages that don't require authentication
  const publicPaths = ["/unauthorized"];

  // If accessing public page (e.g. /unauthorized) while authenticated, redirect to root "/"
  if (publicPaths.some((path) => to.path === path || to.path.endsWith(path))) {
    if (isAuthenticated) {
      return navigateTo("/", { replace: true });
    }
    return;
  }

  // If not authenticated, redirect to unauthorized page
  if (!isAuthenticated) {
    return navigateTo("/unauthorized", { replace: true });
  }

  // Fetch & verify user profile (reuses cached profile after first load)
  try {
    await fetchUserProfile();
  } catch (error: any) {
    // Only remove token and redirect if backend explicitly responded with 401 Unauthorized
    if (error?.status === 401 || error?.statusCode === 401 || error?.data?.statusCode === 401) {
      removeToken();
      return navigateTo("/unauthorized?reason=login_failed", { replace: true });
    }
  }
});
