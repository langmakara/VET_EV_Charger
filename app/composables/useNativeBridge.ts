import { callHandler, registerHandler } from 'web-bridge-gateway'
import * as Sentry from '@sentry/vue'

// ─── ABA MINI-APP TYPES & PAYLOADS ──────────────────────────────────────────

export interface AbaProfilePayload {
  app_id: string
  hash: string // SHA-256 generated on server: UPPER(SHA256(appId+firstName+lastName+fullName+sex+nationality/dobShort+dobFull+nidNumber+secretKey))
}

export interface AbaPaymentPayload {
  account: string
  amount: string // 2 decimal places e.g., "12.00"
  currency: string
  vendorId: string
  useDefault: boolean
  hash: string // SHA-256 generated on server: UPPER(SHA256(account+amount+currency+secretKey))
}

export interface CalendarPayload {
  startDate: number
  endDate: number
  title: string
  description: string
}

export interface NativeLocationResponse {
  latitude: string | number
  longitude: string | number
  [key: string]: any
}

// ─── ERROR HANDLING ────────────────────────────────────────────────────────

/**
 * Standardized ABA Error Handler
 * Translates errors to standard categories and logs to Sentry & Native
 */
const handleBridgeError = (handlerName: string, error: any) => {
  let errorCode = 'APP-UNKNOWN'
  let displayMessage = 'Service provider technical issues'

  if (error?.code) {
    // 400-500 Vendor server errors
    if (error.code >= 400 && error.code <= 500) {
      displayMessage = `Service provider technical issues. Ref: [${error.transactionId || 'N/A'}][${error.code}]`
    }
    // Timeout
    else if (error.code === 'TIMEOUT') {
      displayMessage = 'Request timed out. Please try again.'
      errorCode = 'APP-TIMEOUT'
    }
    // Bridge/Native errors
    else if (error.code.toString().startsWith('NATIVE')) {
      errorCode = error.code
    }
  }

  const errorObj = new Error(
    `[${handlerName}] ${displayMessage} | Original: ${error?.message || JSON.stringify(error)}`
  )

  // 1. Log to Sentry for crash tracking
  if (import.meta.client) {
    Sentry.captureException(errorObj, {
      extra: { handlerName, errorData: error }
    })
  }

  // 2. Log to Native Bridge
  try {
    callHandler('logError', { detail: errorObj.message })
  } catch (e) {}

  return Promise.reject(errorObj)
}

// ─── 1. MINI-APP TO NATIVE (callHandler) ───────────────────────────────────

export const abaBridge = {
  getProfile: (payload: AbaProfilePayload) =>
    callHandler('getProfile', payload).catch((e) => handleBridgeError('getProfile', e)),
  getDefaultAcc: (payload: { currency: string; amount: string }) =>
    callHandler('getDefaultAcc', payload).catch((e) => handleBridgeError('getDefaultAcc', e)),
  doPayment: (payload: AbaPaymentPayload) =>
    callHandler('doPayment', payload).catch((e) => handleBridgeError('doPayment', e)),
  closeApp: () => callHandler('closeApp', {}).catch((e) => handleBridgeError('closeApp', e)),
  setBarTitle: (title: string, bgColor: string = '') =>
    callHandler('setBarTitle', { title, bgColor }).catch((e) =>
      handleBridgeError('setBarTitle', e)
    ),
  uploadFile: (filters: { crop?: boolean; type?: string[] }) =>
    callHandler('uploadFile', filters).catch((e) => handleBridgeError('uploadFile', e)),
  getConfig: () => callHandler('getConfig', {}).catch((e) => handleBridgeError('getConfig', e)),
  setPlayList: (payload: any) =>
    callHandler('setPlayList', payload).catch((e) => handleBridgeError('setPlayList', e)),
  setAudioPlay: (payload: any) =>
    callHandler('setAudioPlay', payload).catch((e) => handleBridgeError('setAudioPlay', e)),
  getPlayingId: () =>
    callHandler('getPlayingId', {}).catch((e) => handleBridgeError('getPlayingId', e)),
  switchPlayerMode: (mode: string) =>
    callHandler('switchPlayerMode', { mode }).catch((e) =>
      handleBridgeError('switchPlayerMode', e)
    ),
  openMap: (payload: { lat: number; lng: number }) =>
    callHandler('openMap', payload).catch((e) => handleBridgeError('openMap', e)),
  share: (payload: { files: string[]; type: 'single' | 'multiple' }) =>
    callHandler('share', payload).catch((e) => handleBridgeError('share', e)),
  backToHomePage: () =>
    callHandler('backToHomePage', {}).catch((e) => handleBridgeError('backToHomePage', e)),
  addCalendar: (payload: CalendarPayload) =>
    callHandler('addCalendar', payload).catch((e) => handleBridgeError('addCalendar', e)),
  // Request location permission on mobile app
  requestCurrentLocation: () =>
    callHandler('requestCurrentLocation', {}).catch((e) =>
      handleBridgeError('requestCurrentLocation', e)
    ),
  // API #5: Get current GPS coordinates from mobile app
  getCurrentLocation: () =>
    callHandler<NativeLocationResponse>('getCurrentLocation', {}).catch((e) =>
      handleBridgeError('getCurrentLocation', e)
    ),
  download: (url: string) =>
    callHandler('download', { url }).catch((e) => handleBridgeError('download', e)),
  openApp: (type: 'phone' | 'email', address: string) =>
    callHandler('openApp', { type, address }).catch((e) => handleBridgeError('openApp', e)),
  logError: (detail: string) =>
    callHandler('logError', { detail }).catch((e) => handleBridgeError('logError', e)),
  previewPDF: (url: string) =>
    callHandler('previewPDF', { url }).catch((e) => handleBridgeError('previewPDF', e)),
  getFavorite: () =>
    callHandler('getFavorite', {}).catch((e) => handleBridgeError('getFavorite', e)),
  requestVoiceRecord: () =>
    callHandler('requestVoiceRecord', {}).catch((e) => handleBridgeError('requestVoiceRecord', e)),
  getDeviceInfo: () =>
    callHandler('getDeviceInfo', {}).catch((e) => handleBridgeError('getDeviceInfo', e)),
  confirmOnClose: (confirm: boolean) =>
    callHandler('confirmOnClose', { confirm }).catch((e) => handleBridgeError('confirmOnClose', e)),
  getContact: () => callHandler('getContact', {}).catch((e) => handleBridgeError('getContact', e))
}

// ─── COMPATIBILITY LAYER (Preserving existing public API) ──────────────────

export const sendTitleToFlutter = (titleName: string, attempt = 0): boolean => {
  if (typeof window === 'undefined' || !titleName) return false
  abaBridge.setBarTitle(titleName, '') // Empty bgColor uses default gradient
  return true
}

export const getCurrentNativeLocation = async (timeoutMs: number = 5000): Promise<{
  lat: number
  lng: number
  latitude: number
  longitude: number
  accuracy?: number
} | null> => {
  if (!import.meta.client) return null

  try {
    // 1. Request location permission on mobile app first
    try {
      await abaBridge.requestCurrentLocation()
    } catch (permErr) {
      console.warn('requestCurrentLocation permission warning:', permErr)
    }

    // 2. Fetch coordinates via Native Bridge (getCurrentLocation) only
    const bridgePromise = abaBridge.getCurrentLocation()
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    )

    let loc: any = await Promise.race([bridgePromise, timeoutPromise])

    if (typeof loc === 'string') {
      try {
        loc = JSON.parse(loc)
      } catch {}
    }

    // According to ABA API #5 specification: returns { latitude: "0.000000", longitude: "0.000000" }
    const rawLat = loc?.latitude ?? loc?.lat
    const rawLng = loc?.longitude ?? loc?.lng

    if (rawLat !== undefined && rawLat !== null && rawLng !== undefined && rawLng !== null) {
      const lat = Number(rawLat)
      const lng = Number(rawLng)

      // Coordinates must be valid and not 0,0 (uninitialized / no-fix GPS)
      if (!isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
        return {
          lat,
          lng,
          latitude: lat,
          longitude: lng,
          accuracy: 10 // Default to 10 if not provided by ABA
        }
      }
    }
  } catch (e) {
    console.warn('ABA Location bridge call failed:', e)
  }

  return null
}

// ─── THE COMPOSABLE ────────────────────────────────────────────────────────

export const useNativeBridge = () => {
  const showToast = (message: string) => {
    // ABA Spec doesn't define showToast. Fall back to browser alert for local testing.
    if (import.meta.client) alert(message)
  }

  const closeApp = (): boolean => {
    if (import.meta.client) {
      abaBridge.closeApp()
      return true
    }
    return false
  }

  const openDeeplink = (url: string) => {
    if (!import.meta.client || !url) return
    window.location.href = url // Browsers handle deep links natively
  }

  return {
    sendTitleToFlutter,
    getCurrentNativeLocation,
    getCurrentLocation: getCurrentNativeLocation,
    openDeeplink,
    showToast,
    closeApp,
    abaBridge // Expose ABA specifically for Vue components
  }
}

// ─── INITIALIZATION (Listeners & Routing) ──────────────────────────────────

if (import.meta.client) {
  // 1. Hook popstate for Back Button routing to Native Shell
  window.addEventListener('popstate', (event) => {
    // Replicate back behavior - if root page, let native app close/minimize
    const isFirstPage = window.history.state === null || window.history.length <= 1
    if (isFirstPage) {
      abaBridge.backToHomePage()
    }
  })

  // 2. ABA Listeners (native -> web)
  registerHandler('getStatus', (data, responseCallback) => {
    responseCallback({ success: true })
  })

  registerHandler('getFileUpload', (data, responseCallback) => {
    responseCallback({ success: true })
  })

  registerHandler('onPlayIdChange', (data, responseCallback) => {
    responseCallback({ success: true })
  })

  registerHandler('redirectPage', (data, responseCallback) => {
    const payload = data as { propId?: string }
    if (payload && payload.propId) {
      window.location.href = payload.propId // Route by propId
    }
    responseCallback({ success: true })
  })

  registerHandler('getCurrentLocation', (data, responseCallback) => {
    getCurrentNativeLocation().then((loc) => {
      responseCallback({
        latitude: loc?.latitude ? String(loc.latitude) : '0.000000',
        longitude: loc?.longitude ? String(loc.longitude) : '0.000000',
        success: !!loc,
        location: loc
      })
    })
  })
}
