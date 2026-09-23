/**
 * Generic Reverse-Proxy Catch-All
 *
 * Forwards any request hitting /api/proxy/... to the private backend,
 * stripping the /api/proxy (and app.baseURL if present) prefix.
 * This circumvents browser-enforced CORS limitations and prevents endpoint mapping exposures.
 *
 * Example: /vet-car-rental/api/proxy/mobile/bookings → https://backend.com/bookings
 */
export default defineEventHandler(async (event) => {
  // Set CORS headers for all requests hitting proxy
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Origin, X-Requested-With, x-lang-id, lang-id",
    "Access-Control-Max-Age": "86400",
  });

  // Handle preflight OPTIONS request
  if (getMethod(event) === "OPTIONS") {
    setResponseStatus(event, 204);
    return "";
  }

  const baseUrl = resolveApiBaseUrl();

  // Strip prefix (handles app.baseURL like /vet-car-rental/api/proxy or /api/proxy)
  const targetPath = event.path.replace(/.*\/api\/proxy/, "");

  const targetUrl = `${baseUrl}${targetPath}`;

  try {
    return await proxyRequest(event, targetUrl);
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || "Proxy Forwarding Error",
      data: error?.data || error?.message,
    });
  }
});
