/**
 * Utility to extract charger username / code from various QR code formats:
 * - Direct plain string (e.g. "ev01", "CP-001")
 * - URL query parameters (e.g. "?username=ev01", "?chargerUserName=ev01", "?code=ev01")
 * - URL path segments (e.g. "/charger/ev01")
 * - JSON encoded payload (e.g. '{"chargerUserName":"ev01"}')
 */
export function extractUsernameFromQr(scannedCode: string): string {
  if (!scannedCode || typeof scannedCode !== 'string') return ''
  const trimmed = scannedCode.trim()
  if (!trimmed) return ''

  // 1. Try parsing JSON object
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(trimmed)
      const target = Array.isArray(parsed) ? parsed[0] : parsed
      const user =
        target?.username ||
        target?.chargerUsername ||
        target?.chargerUserName ||
        target?.chargerCode ||
        target?.code ||
        target?.evseUid ||
        target?.evse_uid ||
        target?.user_name
      if (user && typeof user === 'string' && user.trim()) {
        return user.trim()
      }
      if (typeof user === 'number') {
        return String(user)
      }
    } catch {}
  }

  // 2. Try parsing URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('ws://') ||
    trimmed.startsWith('wss://') ||
    trimmed.includes('://') ||
    (trimmed.includes('?') && trimmed.includes('='))
  ) {
    try {
      const urlStr = trimmed.includes('://') ? trimmed : `https://${trimmed}`
      const url = new URL(urlStr)
      const usernameParam =
        url.searchParams.get('username') ||
        url.searchParams.get('chargerUsername') ||
        url.searchParams.get('chargerUserName') ||
        url.searchParams.get('chargerCode') ||
        url.searchParams.get('code') ||
        url.searchParams.get('evseUid') ||
        url.searchParams.get('evse_uid') ||
        url.searchParams.get('user_name')

      if (usernameParam && usernameParam.trim()) {
        return usernameParam.trim()
      }

      // If URL has path segments like /qr/ev01 or /charger/ev01
      const pathSegments = url.pathname.split('/').filter(Boolean)
      if (pathSegments.length > 0) {
        const last = pathSegments[pathSegments.length - 1]
        if (last && !['qr', 'scan', 'qr_scan', 'charger', 'ev'].includes(last.toLowerCase())) {
          return decodeURIComponent(last).trim()
        }
      }
    } catch {}
  }

  // 3. Fallback: return raw trimmed string
  return trimmed
}

