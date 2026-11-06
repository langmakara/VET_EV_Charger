// composables/useABAMiniApp.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  ABABridgeService, 
  type ABADeviceInfo, 
  type ABAPaymentPayload, 
  type ABABarTitlePayload,
  type ABAPaymentStatusResponse,
  type ABAUserProfile,
  type ABALocationResponse
} from '@/services/abaBridge';

// Shared global state across all pages and components
const sharedUserProfile = ref<ABAUserProfile | null>(null);
const isProcessing = ref(false);

export function useABAMiniApp() {
  const paymentStatus = ref<ABAPaymentStatusResponse | null>(null);
  const userProfile = sharedUserProfile;
  
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
   */
  const getProfile = async (forceRefresh = false): Promise<ABAUserProfile> => {
    if (sharedUserProfile.value && !forceRefresh) {
      return sharedUserProfile.value;
    }
    isProcessing.value = true;
    try {
      const profile = await ABABridgeService.invokeNative<ABAUserProfile>('getProfile', {});
      sharedUserProfile.value = profile;
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
   * Closes active hybrid webview interface panel layout structures instantly
   */
  const closeMiniApp = (): void => {
    ABABridgeService.invokeNative('closeApp', {}).catch(() => {});
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
    executePayment,
    closeMiniApp,
    getDeviceInfo
  };
}

export function useDeviceLocation() {
  const currentCoordinates = ref<ABALocationResponse | null>(null);
  const isHardwareScanning = ref(false);
  let destroyLocationListener: (() => void) | null = null;

  const triggerHardwareSync = async () => {
    isHardwareScanning.value = true;
    try {
      // 1. Request location permission from native host container
      await ABABridgeService.invokeNative('requestCurrentLocation', {});

      // 2. Query GPS coordinates via native host bridge
      const coords = await ABABridgeService.invokeNative<ABALocationResponse>('getCurrentLocation', {});
      if (coords && coords.latitude && coords.longitude) {
        currentCoordinates.value = {
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
          accuracy: coords.accuracy
        };
      }
    } catch (err) {
      console.warn('[useDeviceLocation] Failed to acquire device coordinates from native bridge:', err);
    } finally {
      isHardwareScanning.value = false;
    }
  };

  onMounted(() => {
    // Listen for incoming location push events if emitted by native bridge
    destroyLocationListener = ABABridgeService.observeNativeEvent<ABALocationResponse>(
      'getCurrentLocation',
      (coords) => {
        if (coords && coords.latitude && coords.longitude) {
          currentCoordinates.value = {
            latitude: Number(coords.latitude),
            longitude: Number(coords.longitude),
            accuracy: coords.accuracy
          };
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
