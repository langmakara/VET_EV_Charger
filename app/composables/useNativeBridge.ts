// composables/useABAMiniApp.ts
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { 
  ABABridgeService, 
  type ABADeviceInfo, 
  type ABAPaymentPayload, 
  type ABABarTitlePayload,
  type ABAPaymentStatusResponse,
  type ABAUserProfile,
  type ABALocationResponse,
  type ABAOpenAppPayload,
  type ABAOpenAppName
} from '@/services/abaBridge';
import { useSendProfile } from '@/composables/useSendProfile';
import { changeAppLanguage } from '~/helpers/languages';

// Shared global state across all pages and components
const sharedUserProfile = ref<ABAUserProfile | null>(null);
const isProcessing = ref(false);

// Reactive watcher: sync language whenever profile.lang is populated or updated
if (import.meta.client) {
  watch(
    () => sharedUserProfile.value?.lang,
    (newLang) => {
      if (newLang) {
        changeAppLanguage(newLang);
      }
    }
  );

  // Listen for native language switch events if supported by mobile app container
  try {
    ABABridgeService.observeNativeEvent<{ lang: string }>('onLanguageChange', (data) => {
      if (data?.lang) {
        changeAppLanguage(data.lang);
        if (sharedUserProfile.value) {
          sharedUserProfile.value.lang = data.lang;
        }
      }
    });
  } catch (_) {}
}

export function useABAMiniApp() {
  const paymentStatus = ref<ABAPaymentStatusResponse | null>(null);
  const userProfile = sharedUserProfile;
  const { sendProfile, authResponse } = useSendProfile();
  
  let destroyPaymentListener: (() => void) | null = null;

  /**
   * Adjusts the Mobile App Header Layout Styling Configuration properties dynamically
   */
  const setBarTitle = async (config: ABABarTitlePayload): Promise<void> => {
    return await ABABridgeService.invokeNative<void>('setBarTitle', config);
  };

  /**
   * Fetches basic profile metadata once and caches it.
   * If forceRefresh is false and profile already exists, returns cached profile.
   * Automatically changes the mini app language to match profile.lang ('en', 'kh', 'zh').
   * When profile data is retrieved successfully from mobile app, sends all data to useAbaAuthTokenMutation.
   */
  const getProfile = async (forceRefresh = false): Promise<ABAUserProfile> => {
    if (sharedUserProfile.value && !forceRefresh) {
      if (sharedUserProfile.value.lang) {
        await changeAppLanguage(sharedUserProfile.value.lang);
      }
      return sharedUserProfile.value;
    }
    isProcessing.value = true;
    try {
      const profile = await ABABridgeService.invokeNative<ABAUserProfile>('getProfile', {});
      sharedUserProfile.value = profile;

      // Automatically change mini app language based on profile.lang ('en', 'kh', 'zh')
      if (profile?.lang) {
        try {
          await changeAppLanguage(profile.lang);
        } catch (langErr) {
          console.error('[useABAMiniApp] Failed to change language from profile.lang:', langErr);
        }
      }

      // When get profile data from mobile app success, send all data to api useAbaAuthTokenMutation
      try {
        await sendProfile(profile);
      } catch (authErr) {
        console.error('[useABAMiniApp] Failed to authenticate profile token with backend:', authErr);
      }

      return profile;
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * Launches secure checkout modal configurations overlay context window elements
   */
  const executePayment = async (payload: ABAPaymentPayload): Promise<void> => {
    isProcessing.value = true;
    try {
      await ABABridgeService.invokeNative<void>('doPayment', payload);
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * Metadata extraction utility capturing environment runtime criteria metrics
   */
  const getDeviceInfo = async (): Promise<ABADeviceInfo> => {
    return await ABABridgeService.invokeNative<ABADeviceInfo>('getDeviceInfo', {});
  };

  /**
   * API #12: Open native map app or browser via openMap bridge
   * Payload: { lat: "xxx", lng: "xxx" }
   */
  const openMap = async (lat: string | number, lng: string | number): Promise<void> => {
    const latStr = String(lat);
    const lngStr = String(lng);
    try {
      await ABABridgeService.openMap({ lat: latStr, lng: lngStr });
    } catch (err) {
      // Fallback to web Google Maps if outside mobile app or bridge fails
      if (typeof window !== 'undefined') {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latStr)},${encodeURIComponent(lngStr)}`;
        window.open(url, '_blank');
      }
    }
  };

  /**
   * API #18: Open native external application (Phone call or Email) via openApp bridge
   * Payload: { name: 'phone' | 'email' | 'mail', value: string }
   * Includes fallback to web tel: / mailto: if outside mobile app or bridge fails
   */
  const openApp = async (payload: ABAOpenAppPayload): Promise<void> => {
    try {
      await ABABridgeService.openApp(payload);
    } catch (err) {
      if (typeof window !== 'undefined') {
        const val = (payload.value || '').trim();
        if (payload.name === 'phone') {
          const sanitized = val.replace(/\s+/g, '');
          window.location.href = `tel:${sanitized}`;
        } else if (payload.name === 'email' || payload.name === 'mail') {
          window.location.href = `mailto:${val}`;
        }
      }
    }
  };

  /**
   * Helper to initiate phone call via API #18 openApp bridge
   */
  const openPhoneCall = async (phoneNumber: string): Promise<void> => {
    return openApp({ name: 'phone', value: phoneNumber });
  };

  /**
   * Helper to open email composer via API #18 openApp bridge
   */
  const openEmail = async (emailAddress: string): Promise<void> => {
    return openApp({ name: 'mail', value: emailAddress });
  };

  /**
   * Closes active hybrid webview interface panel layout structures instantly
   */
  const closeMiniApp = (): void => {
    ABABridgeService.invokeNative('closeApp', {}).catch(() => {});
  };

  /**
   * Navigates back to the mobile application home screen
   */
  const backToHomePage = async (): Promise<void> => {
    await ABABridgeService.backToHomePage();
  };

  // --- Automatic Lifecycle Synchronization Hooks ---
  onMounted(() => {
    // Standardized Listener Binding Pattern protecting background thread operations cleanly
    destroyPaymentListener = ABABridgeService.observeNativeEvent<ABAPaymentStatusResponse>(
      'getStatus',
      (status) => {
        paymentStatus.value = status;
        console.log('[Native Event Sync] Payment confirmation received:', status);
      }
    );
  });

  onUnmounted(() => {
    // Clean up to prevent ghost event loops
    if (destroyPaymentListener) {
      destroyPaymentListener();
    }
  });

  return {
    paymentStatus,
    userProfile,
    setBarTitle,
    getProfile,
    sendProfile,
    authResponse,
    executePayment,
    closeMiniApp,
    backToHomePage,
    getDeviceInfo,
    openMap,
    openApp,
    openPhoneCall,
    openEmail
  };
}

// Cached coordinates loader from localStorage for instant availability on startup
const getInitialCoordinates = (): ABALocationResponse | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('vet_ev_last_coordinates');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.latitude != null && parsed?.longitude != null) {
        const lat = Number(parsed.latitude);
        const lng = Number(parsed.longitude);
        if (!isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
          return {
            latitude: lat,
            longitude: lng
          };
        }
      }
    }
  } catch {}
  return null;
};

// Shared global coordinates and scanning state across all pages and components
const sharedCoordinates = ref<ABALocationResponse | null>(getInitialCoordinates());
const isHardwareScanning = ref(false);

type LocationCallback = (coords: ABALocationResponse) => void;
let pendingListeners: LocationCallback[] = [];

/**
 * Validates and normalizes location data received from ABA Native Bridge.
 * ABA Native Bridge returns: { "latitude": "0.000000", "longitude": "0.000000" } without accuracy.
 */
const updateCoordinates = (coords: any): ABALocationResponse | null => {
  if (!coords) return null;
  const rawLat = coords.latitude ?? coords.lat;
  const rawLng = coords.longitude ?? coords.lng;
  if (rawLat == null || rawLng == null) return null;

  const lat = Number(rawLat);
  const lng = Number(rawLng);

  // ABA Bridge returns "0.000000" (or 0) when GPS is acquiring or permission not yet granted
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    return null;
  }

  const resolved: ABALocationResponse = {
    latitude: lat,
    longitude: lng
  };

  sharedCoordinates.value = resolved;
  isHardwareScanning.value = false;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('vet_ev_last_coordinates', JSON.stringify(resolved));
    } catch {}
  }

  // Notify any pending triggerHardwareSync callers
  if (pendingListeners.length > 0) {
    const cbs = [...pendingListeners];
    pendingListeners = [];
    cbs.forEach((cb) => cb(resolved));
  }

  return resolved;
};

// Global reactive listener: register handler 'getCurrentLocation' so ABA Native Bridge can push coordinates
if (import.meta.client) {
  try {
    ABABridgeService.observeNativeEvent<ABALocationResponse>('getCurrentLocation', (coords) => {
      console.log('[Native Bridge] Received On getCurrentLocation push:', coords);
      updateCoordinates(coords);
    });
  } catch (_) {}
}

export function useDeviceLocation() {
  const currentCoordinates = sharedCoordinates;

  const triggerHardwareSync = async (timeoutMs = 8000): Promise<ABALocationResponse | null> => {
    isHardwareScanning.value = true;
    try {
      // 1. Request current location from device via ABA Native Bridge
      // This instructs the native container to prompt for user permission and activate GPS.
      // Once location is ready, the native container pushes the fix to the registered 'getCurrentLocation' event.
      try {
        await ABABridgeService.invokeNative('requestCurrentLocation', {});
      } catch (err) {
        console.warn('[useDeviceLocation] requestCurrentLocation error:', err);
      }

      // 2. Wait for native container to push GPS fix via 'getCurrentLocation' listener
      const result = await new Promise<ABALocationResponse | null>((resolve) => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        const onCoordsReceived: LocationCallback = (coords) => {
          if (timer) clearTimeout(timer);
          resolve(coords);
        };

        pendingListeners.push(onCoordsReceived);

        timer = setTimeout(() => {
          pendingListeners = pendingListeners.filter((cb) => cb !== onCoordsReceived);
          resolve(sharedCoordinates.value);
        }, timeoutMs);
      });

      return result || sharedCoordinates.value;
    } catch (err) {
      console.warn('[useDeviceLocation] Failed to acquire device coordinates from ABA Native Bridge:', err);
      return sharedCoordinates.value;
    } finally {
      isHardwareScanning.value = false;
    }
  };

  return {
    currentCoordinates,
    isHardwareScanning,
    triggerHardwareSync
  };
}
