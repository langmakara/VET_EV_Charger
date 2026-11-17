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
      if (parsed?.latitude && parsed?.longitude) {
        return {
          latitude: Number(parsed.latitude),
          longitude: Number(parsed.longitude),
          accuracy: parsed.accuracy
        };
      }
    }
  } catch {}
  return null;
};

// Shared global coordinates and scanning state across all pages and components
const sharedCoordinates = ref<ABALocationResponse | null>(getInitialCoordinates());
const isHardwareScanning = ref(false);

export function useDeviceLocation() {
  const currentCoordinates = sharedCoordinates;
  let destroyLocationListener: (() => void) | null = null;

  const triggerHardwareSync = async (retries = 4, delayMs = 800): Promise<ABALocationResponse | null> => {
    isHardwareScanning.value = true;
    try {
      // 1. Request location permission from native host container
      try {
        await ABABridgeService.invokeNative('requestCurrentLocation', {});
      } catch (err) {
        console.warn('[useDeviceLocation] requestCurrentLocation error:', err);
      }

      // 2. Poll for GPS coordinates via native host bridge (allowing user time to click "Allow" on permission dialog)
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const coords = await ABABridgeService.invokeNative<ABALocationResponse>('getCurrentLocation', {});
          const rawLat = coords?.latitude ?? (coords as any)?.lat;
          const rawLng = coords?.longitude ?? (coords as any)?.lng;

          if (rawLat !== undefined && rawLng !== undefined) {
            const lat = Number(rawLat);
            const lng = Number(rawLng);
            if (!isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
              const resolved: ABALocationResponse = {
                latitude: lat,
                longitude: lng,
                accuracy: coords.accuracy
              };
              currentCoordinates.value = resolved;
              if (typeof window !== 'undefined') {
                localStorage.setItem('vet_ev_last_coordinates', JSON.stringify(resolved));
              }
              return resolved;
            }
          }
        } catch {}

        // Fallback: try navigator.geolocation if available in browser/webview
        if (typeof window !== 'undefined' && navigator.geolocation) {
          try {
            const browserCoords = await new Promise<ABALocationResponse | null>((resolve) => {
              navigator.geolocation.getCurrentPosition(
                (pos) =>
                  resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                  }),
                () => resolve(null),
                { timeout: 2000, enableHighAccuracy: true }
              );
            });
            if (browserCoords) {
              currentCoordinates.value = browserCoords;
              localStorage.setItem('vet_ev_last_coordinates', JSON.stringify(browserCoords));
              return browserCoords;
            }
          } catch {}
        }

        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    } catch (err) {
      console.warn('[useDeviceLocation] Failed to acquire device coordinates from native bridge:', err);
    } finally {
      isHardwareScanning.value = false;
    }
    return currentCoordinates.value;
  };

  onMounted(() => {
    // Listen for incoming location push events if emitted by native bridge
    destroyLocationListener = ABABridgeService.observeNativeEvent<ABALocationResponse>(
      'getCurrentLocation',
      (coords) => {
        const rawLat = coords?.latitude ?? (coords as any)?.lat;
        const rawLng = coords?.longitude ?? (coords as any)?.lng;
        if (rawLat !== undefined && rawLng !== undefined) {
          const lat = Number(rawLat);
          const lng = Number(rawLng);
          if (!isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
            const resolved: ABALocationResponse = {
              latitude: lat,
              longitude: lng,
              accuracy: coords.accuracy
            };
            currentCoordinates.value = resolved;
            if (typeof window !== 'undefined') {
              localStorage.setItem('vet_ev_last_coordinates', JSON.stringify(resolved));
            }
          }
        }
      }
    );
  });

  onUnmounted(() => {
    if (destroyLocationListener) {
      destroyLocationListener();
    }
  });

  return {
    currentCoordinates,
    isHardwareScanning,
    triggerHardwareSync
  };
}
