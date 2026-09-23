
export default defineEventHandler((event) => {
  // Intercept Authorization header from incoming HTTP requests (e.g., initial Flutter WebView loadRequest)
  const authHeader = getRequestHeader(event, "authorization");

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();

    if (token) {
      // Store token in cookie so Nuxt frontend picks it up seamlessly
      setCookie(event, "access_token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false,
        sameSite: "lax",
      });
    }
  }
});
