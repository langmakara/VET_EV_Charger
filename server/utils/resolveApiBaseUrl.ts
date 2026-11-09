/**
 * Server-only utility that resolves the external API base URL.
 * Reads directly from `useRuntimeConfig().public.apiBase`.
 */
export function resolveApiBaseUrl(): string {
  const config = useRuntimeConfig()
  const base = (config.public.apiBase as string) || ''
  return base.replace(/\/+$/, '')
}
