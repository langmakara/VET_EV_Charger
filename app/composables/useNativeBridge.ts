import { Geolocation } from "@capacitor/geolocation";

interface FlutterInAppWebView {
  callHandler: (handlerName: string, ...args: any[]) => Promise<any>;
}

interface NativeBridgeWindow extends Window {
  flutter_inappwebview?: FlutterInAppWebView;
  SetAppBarTitle?: { postMessage: (msg: string) => void };
  Android?: {
    requestLocationPermission?: () => boolean;
    requestPermission?: (type: string) => void;
    getCurrentLocation?: () => string | { lat: number; lng: number; accuracy?: number } | any;
    showToast?: (message: string) => void;
    closeApp?: () => void;
  };
  RequestLocationPermission?: { postMessage: (msg: string) => void };
  CloseApp?: { postMessage: (msg: string) => void };
}

let lastSentTitle: string | null = null;
let pendingRetryTimer: ReturnType<typeof setTimeout> | null = null;
let isPlatformReadyListenerAdded = false;

/**
 * Function to notify Flutter of the current page title.
 * Retries briefly if the native bridge hasn't injected yet, and
 * skips redundant sends if the title hasn't changed.
 */
export const sendTitleToFlutter = (titleName: string, attempt = 0): boolean => {
  if (typeof window === "undefined" || !titleName) return false;

  // Listen for flutterInAppWebViewPlatformReady event to send title immediately when bridge is injected
  if (!isPlatformReadyListenerAdded && typeof window !== "undefined") {
    isPlatformReadyListenerAdded = true;
    window.addEventListener("flutterInAppWebViewPlatformReady", () => {
      if (lastSentTitle) {
        const titleToResend = lastSentTitle;
        lastSentTitle = null; // Reset so sendTitleToFlutter won't skip it
        sendTitleToFlutter(titleToResend);
      }
    });
  }

  // Skip redundant sends (e.g. back-to-back route changes resolving to the same title)
  if (titleName === lastSentTitle) return true;

  const win = window as NativeBridgeWindow;
  const MAX_RETRIES = 10;
  const RETRY_DELAY_MS = 100;

  // 1. flutter_inappwebview package
  if (win.flutter_inappwebview?.callHandler) {
    try {
      win.flutter_inappwebview.callHandler("SetAppBarTitle", titleName).catch(() => {});
      lastSentTitle = titleName;
      if (pendingRetryTimer) {
        clearTimeout(pendingRetryTimer);
        pendingRetryTimer = null;
      }
      return true;
    } catch {}
  }
  // 2. standard webview_flutter package
  else if (win.SetAppBarTitle?.postMessage) {
    try {
      win.SetAppBarTitle.postMessage(titleName);
      lastSentTitle = titleName;
      if (pendingRetryTimer) {
        clearTimeout(pendingRetryTimer);
        pendingRetryTimer = null;
      }
      return true;
    } catch {}
  }

  // Store desired title so the platform ready listener can resend if bridge injects late
  lastSentTitle = titleName;

  // 3. Bridge not ready yet — retry a few times before giving up
  if (attempt < MAX_RETRIES) {
    if (pendingRetryTimer) clearTimeout(pendingRetryTimer);
    pendingRetryTimer = setTimeout(() => {
      const targetTitle = titleName;
      lastSentTitle = null;
      sendTitleToFlutter(targetTitle, attempt + 1);
    }, RETRY_DELAY_MS);
  }

  return false;
};

/**
 * Request location permission from native mobile host app (Android / Flutter / Capacitor)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (!import.meta.client) return false;

  const win = window as NativeBridgeWindow;

  // 1. Native Android WebView bridge call (custom interface)
  if (win.Android?.requestLocationPermission) {
    try {
      const res = win.Android.requestLocationPermission();
      if (typeof res === "boolean") return res;
    } catch {}
  } else if (win.Android?.requestPermission) {
    try {
      win.Android.requestPermission("location");
    } catch {}
  }

  // 2. Native Flutter WebView bridge call
  if (win.flutter_inappwebview) {
    try {
      await win.flutter_inappwebview.callHandler("requestLocationPermission");
    } catch {}
  } else if (win.RequestLocationPermission?.postMessage) {
    try {
      win.RequestLocationPermission.postMessage("request");
    } catch {}
  }

  // 3. Capacitor Geolocation plugin permission request
  try {
    const permStatus = await Geolocation.checkPermissions();
    if (permStatus.location !== "granted") {
      const reqRes = await Geolocation.requestPermissions();
      return reqRes.location === "granted";
    }
    return true;
  } catch {}

  // 4. Standard Web Browser permissions check
  if (navigator?.permissions?.query) {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      if (result.state === "denied") return false;
      if (result.state === "granted") return true;
    } catch (e) {
      // Ignore permission query error
    }
  }

  return true;
};

/**
 * Get current native location coordinates using Native Bridge, Capacitor, or HTML5 Geolocation fallback
 */
export const getCurrentNativeLocation = async (): Promise<{ lat: number; lng: number; accuracy?: number } | null> => {
  if (!import.meta.client) return null;

  // Request permission from native mobile host app first
  await requestLocationPermission();

  const win = window as NativeBridgeWindow;

  // 1. Try Flutter WebView bridge callHandler ("getCurrentLocation")
  if (win.flutter_inappwebview?.callHandler) {
    try {
      const loc = await win.flutter_inappwebview.callHandler("getCurrentLocation");
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        return {
          lat: loc.lat,
          lng: loc.lng,
          accuracy: typeof loc.accuracy === "number" ? loc.accuracy : 10,
        };
      }
    } catch {}
  }

  // 2. Try Android custom native bridge if present
  if (win.Android?.getCurrentLocation) {
    try {
      const raw = win.Android.getCurrentLocation();
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          return {
            lat: parsed.lat,
            lng: parsed.lng,
            accuracy: parsed.accuracy ?? 10,
          };
        }
      }
    } catch {}
  }

  // 3. Try Capacitor Geolocation plugin
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 5000,
    });
    if (position?.coords) {
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    }
  } catch {}

  // 4. Fallback to HTML5 Geolocation API with high accuracy -> low accuracy fallback
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    const tryGetPosition = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          if (highAccuracy) {
            tryGetPosition(false);
          } else {
            resolve(null);
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 5000 : 10000,
          maximumAge: 10000,
        },
      );
    };

    tryGetPosition(true);
  });
};

/**
 * Composable for communicating with Native Mobile Apps (Android WebView & Flutter WebView)
 */
export const useNativeBridge = () => {
  /**
   * Display a native toast or notification message
   */
  const showToast = (message: string) => {
    if (!import.meta.client) return;

    const win = window as NativeBridgeWindow;

    if (win.Android?.showToast) {
      try {
        win.Android.showToast(message);
      } catch {}
    }
  };

  /**
   * Close the native WebView activity / screen to return to the mobile app
   */
  const closeApp = (): boolean => {
    if (!import.meta.client) return false;

    const win = window as NativeBridgeWindow;
    let isNativeHandled = false;

    // 1. Flutter WebView callHandler
    if (win.flutter_inappwebview?.callHandler) {
      try {
        win.flutter_inappwebview.callHandler("closeApp").catch(() => {});
        win.flutter_inappwebview.callHandler("close").catch(() => {});
        isNativeHandled = true;
      } catch {}
    }

    // 2. Flutter JS Channel postMessage
    if (win.CloseApp?.postMessage) {
      try {
        win.CloseApp.postMessage("close");
        isNativeHandled = true;
      } catch {}
    }

    // 3. Android WebView custom bridge interface
    if (win.Android?.closeApp) {
      try {
        win.Android.closeApp();
        isNativeHandled = true;
      } catch {}
    }

    return isNativeHandled;
  };

  /**
   * Open external URL or native app deeplink (e.g., abamobilebank://...)
   */
  const openDeeplink = (url: string) => {
    if (!import.meta.client || !url) return;

    const win = window as NativeBridgeWindow;

    // 1. Try Flutter WebView bridge callHandler if registered
    if (win.flutter_inappwebview?.callHandler) {
      try {
        win.flutter_inappwebview.callHandler("openUrl", url).catch(() => {
          window.location.href = url;
        });
        return;
      } catch {}
    }

    // 2. Fallback to standard web location redirection for deep link scheme
    window.location.href = url;
  };

  return {
    sendTitleToFlutter,
    requestLocationPermission,
    getCurrentNativeLocation,
    openDeeplink,
    showToast,
    closeApp,
  };
};

