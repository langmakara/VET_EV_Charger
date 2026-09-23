<template>
  <div class="ion-page">
    <ion-content class="map-content">
      <!-- Top Overlay Container (Close button + Top Search Bar) -->
      <div class="top-bar-overlay">
        <button class="close-btn" @click="cancel" aria-label="Close map">
          <ion-icon :icon="closeOutline"></ion-icon>
        </button>

        <SearchMap v-model:selectedAddress="selectedAddress" v-model:isGeocoding="isGeocoding" :selected-coords="selectedCoords" @select-location="onLocationSelected" />
      </div>

      <!-- Map Container -->
      <div class="map-wrapper">
        <GoogleMap ref="mapRef" :api-key="apiKey" map-id="car-rental-map" :libraries="['maps', 'marker', 'places']" v-model:center="center" v-model:zoom="zoom" :map-type-id="'hybrid'" :disable-default-ui="true" :map-type-control="false" :fullscreen-control="false" :zoom-control="false" :street-view-control="false" class="map-element" :options="mapOptions" @click="onMapClick">
          <AdvancedMarker v-if="selectedCoords" :options="{ position: selectedCoords, title: 'Selected Location' }" />
        </GoogleMap>
      </div>

      <!-- Floating Bottom Card -->
      <div class="bottom-sheet-container">
        <div class="bottom-sheet-card">
          <!-- Floating Current Location FAB (Bottom Right above sheet) -->
          <button class="find-location-fab" :disabled="isLocatingCurrent" @click="selectCurrentLocation" aria-label="Find current location">
            <ion-spinner v-if="isLocatingCurrent" name="crescent" color="light" class="fab-spinner"></ion-spinner>
            <ion-icon v-else :icon="locateOutline" class="fab-icon"></ion-icon>
          </button>

          <div class="drag-handle"></div>

          <!-- Confirmation Card -->
          <div class="confirm-view">
            <div class="location-info-row">
              <div class="location-icon-container">
                <ion-icon :icon="locationOutline" class="location-main-icon"></ion-icon>
              </div>
              <div class="location-details">
                <p class="location-subtitle">
                  {{ selectedAddress}}
                </p>
              </div>
            </div>
            <div class="confirm-action">
              <AppButton color="primary" expand="block" :disabled="isGeocoding || !selectedAddress" @click="confirm">
                <ion-spinner v-if="isGeocoding" name="crescent" color="light" class="btn-spinner"></ion-spinner>
                <span v-else>Confirm</span>
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, onBeforeUnmount } from "vue";
import { GoogleMap, AdvancedMarker } from "vue3-google-map";
import { IonContent, IonSpinner, IonIcon, modalController } from "@ionic/vue";
import { closeOutline, locationOutline, locateOutline } from "ionicons/icons";
import SearchMap from "./SearchMap.vue";
import AppButton from "~/components/Button/AppButton.vue";
import { requestLocationPermission, getCurrentNativeLocation, useNativeBridge } from "~/composables/useNativeBridge";

const props = withDefaults(
  defineProps<{
    initialAddress?: string;
    initialCoords?: { lat: number; lng: number } | null;
    type?: "pickup" | "dropoff" | string;
    title?: string;
  }>(),
  {
    initialAddress: "",
    initialCoords: null,
    type: "pickup",
    title: "",
  },
);


const config = useRuntimeConfig();
const apiKey = config.public.googleMapApiKey || import.meta.env.VITE_GOOGLE_MAP_API_KEY;

const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);
const selectedAddress = ref<string>(props.initialAddress || "");
const isGeocoding = ref<boolean>(false);
const isLocatingCurrent = ref<boolean>(false);
const selectedCoords = ref<{ lat: number; lng: number } | null>(props.initialCoords || null);
// Tracks the accuracy (meters) reported by the browser for the last geolocation fix,
// so the UI can warn the user when the pin might be off by more than a trivial amount.
const lastAccuracyMeters = ref<number | null>(null);

// Default center: Phnom Penh, Cambodia
const center = ref<{ lat: number; lng: number }>(props.initialCoords || { lat: 11.5564, lng: 104.9282 });
const zoom = ref<number>(14);

// --- Zoom debounce plumbing -------------------------------------------------
// Any work that should react to the *settled* zoom level (not every tick of a
// fast pinch/scroll gesture) should be added inside this watcher rather than
// a separate plain `watch(zoom, ...)`. This avoids piling extra work on top
// of the burst of tile/viewport requests the Maps SDK already fires during
// rapid zooming.
let zoomDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const ZOOM_DEBOUNCE_MS = 250;

watch(zoom, (newZoom) => {
  if (zoomDebounceTimer) clearTimeout(zoomDebounceTimer);
  zoomDebounceTimer = setTimeout(() => {
    // Place any zoom-reactive logic here (e.g. re-fetching nearby places,
    // adjusting marker clustering, etc.) once zoom has settled.
  }, ZOOM_DEBOUNCE_MS);
});

onBeforeUnmount(() => {
  if (zoomDebounceTimer) clearTimeout(zoomDebounceTimer);
});
// -----------------------------------------------------------------------------

const mapOptions = computed(() => ({
  disableDefaultUI: true,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: false,
  streetViewControl: false,
  rotateControl: false,
  scaleControl: false,
  maxZoom: 19,
  minZoom: 3,
  mapTypeId: "satellite",
  // "greedy" treats one-finger pan/zoom gestures directly, matching typical
  // native map UX inside a modal (no "use two fingers" cooperative overlay).
  gestureHandling: "greedy",
  // Forces discrete integer zoom steps instead of smooth/continuous zoom.
  // Continuous zoom fires many more intermediate viewport requests during a
  // fast pinch gesture, which increases the number of in-flight requests
  // that get canceled mid-zoom (reported as net::ERR_FAILED) — a likely
  // trigger for the WebView's native error overlay.
  isFractionalZoomEnabled: false,
  styles: [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
}));

const areaName = computed(() => {
  if (!selectedAddress.value) return "";
  const parts = selectedAddress.value.split(",");
  return parts[0] ? parts[0].trim() : "";
});

// Share the loaded google.maps namespace + live map instance with SearchMap.vue
provide(
  "mapsApi",
  computed(() => mapRef.value?.api ?? null),
);
provide(
  "mapInstance",
  computed(() => mapRef.value?.map ?? null),
);

const cancel = () => {
  modalController.dismiss(null, "cancel");
};

const confirm = () => {
  if (selectedAddress.value) {
    modalController.dismiss({ location: selectedAddress.value, coords: selectedCoords.value }, "confirm");
  } else {
    modalController.dismiss(null, "cancel");
  }
};

// getBestPosition() requests location permission from native mobile app (Android / Flutter / Capacitor)
// and retrieves location via native bridge / Capacitor or HTML5 geolocation fallback.
async function getBestPosition(options?: { timeoutMs?: number; goodAccuracyMeters?: number }): Promise<GeolocationPosition> {
  const timeoutMs = options?.timeoutMs ?? 8000;
  const goodAccuracyMeters = options?.goodAccuracyMeters ?? 20;

  // 1. Request location permission from mobile host app
  await requestLocationPermission();

  // 2. Try native location lookup (Capacitor / Native bridge)
  const nativeLoc = await getCurrentNativeLocation();
  if (nativeLoc) {
    return {
      coords: {
        latitude: nativeLoc.lat,
        longitude: nativeLoc.lng,
        accuracy: nativeLoc.accuracy ?? 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;
  }

  // 3. Fallback to HTML5 watchPosition stream
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    let best: GeolocationPosition | null = null;
    let settled = false;

    const finish = (pos: GeolocationPosition | null, err?: GeolocationPositionError) => {
      if (settled) return;
      settled = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      if (pos) {
        resolve(pos);
      } else {
        reject(err ?? new Error("Unable to determine location."));
      }
    };

    const timer = setTimeout(() => finish(best), timeoutMs);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) {
          best = pos;
        }
        if (pos.coords.accuracy <= goodAccuracyMeters) {
          finish(pos);
        }
      },
      (err) => {
        // Only reject outright if we never got any fix at all.
        if (!best) finish(null, err);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: timeoutMs },
    );
  });
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const api = mapRef.value?.api;
  if (!api) return null;

  try {
    const geocoder = new api.Geocoder();
    const response = await geocoder.geocode({ address });
    const firstResult = response.results?.[0];
    if (firstResult) {
      const location = firstResult.geometry.location;
      return { lat: location.lat(), lng: location.lng() };
    }
  } catch {}
  return null;
}

async function fetchAddress(lat: number, lng: number) {
  const api = mapRef.value?.api;
  if (!api) {
    selectedAddress.value = `${lat.toFixed(15)}, ${lng.toFixed(15)}`;
    return;
  }

  isGeocoding.value = true;
  try {
    const geocoder = new api.Geocoder();
    const response = await geocoder.geocode({ location: { lat, lng } });
    const firstResult = response.results?.[0];
    if (firstResult) {
      selectedAddress.value = firstResult.formatted_address;
    } else {
      selectedAddress.value = `${lat.toFixed(15)}, ${lng.toFixed(15)}`;
    }
  } catch {
    selectedAddress.value = `${lat.toFixed(15)}, ${lng.toFixed(15)}`;
  } finally {
    isGeocoding.value = false;
  }
}

async function updateMarker(lat: number, lng: number) {
  selectedCoords.value = { lat, lng };
  await fetchAddress(lat, lng);
}

// Once the GoogleMap component reports ready, set up initial location/address if needed
watch(
  () => mapRef.value?.ready,
  async (ready) => {
    if (!ready) return;

    try {
      if (props.initialCoords) {
        center.value = props.initialCoords;
        selectedCoords.value = props.initialCoords;
        if (!selectedAddress.value) {
          await fetchAddress(props.initialCoords.lat, props.initialCoords.lng);
        }
        return;
      }

      if (props.initialAddress) {
        const coords = await geocodeAddress(props.initialAddress);
        if (coords) {
          center.value = coords;
          selectedCoords.value = coords;
          selectedAddress.value = props.initialAddress;
          return;
        }
      }

      // Default location (Phnom Penh) without auto-locating GPS
      selectedCoords.value = center.value;
      if (!selectedAddress.value) {
        await fetchAddress(center.value.lat, center.value.lng);
      }
    } catch {
      selectedCoords.value = center.value;
      if (!selectedAddress.value) {
        await fetchAddress(center.value.lat, center.value.lng);
      }
    }
  },
  { immediate: true },
);

function onMapClick(event: any) {
  const latLng = event.latLng;
  if (!latLng) return;
  const lat = typeof latLng.lat === "function" ? latLng.lat() : latLng.lat;
  const lng = typeof latLng.lng === "function" ? latLng.lng() : latLng.lng;
  lastAccuracyMeters.value = null;
  updateMarker(lat, lng);
}

async function selectCurrentLocation() {
  isLocatingCurrent.value = true;
  try {
    const position = await getBestPosition();
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    lastAccuracyMeters.value = position.coords.accuracy;

    center.value = { lat, lng };
    zoom.value = 15;

    await updateMarker(lat, lng);
  } catch (err: any) {
    const { showToast } = useNativeBridge();

    let errorMsg = "Unable to get current location. Please grant location permission in app settings.";
    if (typeof window !== "undefined" && !window.isSecureContext) {
      errorMsg = "Location requires HTTPS connection. Please load the app securely.";
    } else if (err?.code === 1) {
      // PERMISSION_DENIED
      errorMsg = "Location permission denied. Please allow location access in settings.";
    } else if (err?.code === 2) {
      // POSITION_UNAVAILABLE
      errorMsg = "Location unavailable. Please check if GPS/Location Services are turned ON.";
    } else if (err?.code === 3) {
      // TIMEOUT
      errorMsg = "Location request timed out. Please try again or search for your address.";
    }

    showToast(errorMsg);
  } finally {
    isLocatingCurrent.value = false;
  }
}

function onLocationSelected(payload: { lat: number; lng: number; address: string }) {
  lastAccuracyMeters.value = null;
  selectedCoords.value = { lat: payload.lat, lng: payload.lng };
  selectedAddress.value = payload.address;
  center.value = { lat: payload.lat, lng: payload.lng };
  zoom.value = 15;
}
</script>

<style scoped>
@import "~/assets/css/ModalMap.css";

.location-accuracy-hint {
  font-size: 12px;
  color: var(--ion-color-medium, #92949c);
  margin-top: 4px;
}
</style>

<style>
/* Global Google Maps tile load error overlay suppression */
.map-wrapper .gm-style div[style*="text-align: center"],
.map-wrapper .gm-style div[style*="position: absolute"] > span,
.map-wrapper .gm-style .gm-err-container,
.map-wrapper .gm-style .gm-err-content,
.map-wrapper .gm-style .gm-err-message,
.map-wrapper .gm-style .gm-err-title,
.map-wrapper .gm-style .gm-err-autocomplete {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Hide grey error background overlay when satellite tiles fail/abort during rapid zoom */
.map-wrapper .gm-style div[style*="background-color: rgb(229, 227, 223)"],
.map-wrapper .gm-style div[style*="background-color: rgb(248, 249, 250)"] {
  background-color: transparent !important;
}
</style>