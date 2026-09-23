/**
 * Server-only utility that resolves the external API base URL.
 *
 * Replicates the environment-switching logic from the client-side
 * `useApiUrl` composable, but reads from `useRuntimeConfig()` which
 * is safe to call inside the `server/` directory.
 *
 * This avoids importing client composables (`~/composables/useApiUrl`)
 * into server routes — a Nuxt 4 boundary violation.
 */
export function resolveApiBaseUrl(): string {
  const config = useRuntimeConfig()
  const pub = config.public

  const activeEnv = (String(pub.nodeEnv || 'dev')).toLowerCase().trim()

  const apiUrlDev = String(pub.apiUrlDev || '')
  const apiUrlQa = String(pub.apiUrlQa || '')
  const apiUrlLocal = String(pub.apiUrlLocal || '')
  const apiUrlProd = String(pub.apiUrlProd || '')
  const directApiUrl = String(pub.apiUrl || '')

  let baseUrl = ''

  if (directApiUrl && directApiUrl.trim() !== '') {
    baseUrl = directApiUrl.trim()
  } else if (activeEnv === 'pro' || activeEnv === 'production') {
    baseUrl = apiUrlProd || apiUrlDev
  } else if (activeEnv === 'qa') {
    baseUrl = apiUrlQa || apiUrlDev
  } else if (activeEnv === 'local') {
    baseUrl = apiUrlLocal || apiUrlDev
  } else {
    baseUrl = apiUrlDev
  }

  baseUrl = baseUrl.replace(/\/+$/, '')

  return baseUrl
}
