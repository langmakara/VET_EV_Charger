<template>
  <div class="ion-page">
    <ion-content class="map-content" :scroll-y="false">
      <!-- Top Overlay Container (Close button + Top Search Bar) -->
      <div class="top-bar-overlay">
        <ion-grid>
          <ion-row>
            <ion-col size="10">
              <SearchMap
                v-model:selectedAddress="selectedAddress"
                v-model:isGeocoding="isGeocoding"
                :selected-coords="selectedCoords"
                @select-location="onLocationSelected"
                @search-click="onSearchClick"
              />
            </ion-col>
            <ion-col size="2">
              <IconButton name="filter" color="light" size="md" @click="$emit('filter-click')" />
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- Map Container -->
      <div class="map-wrapper">
        <GoogleMap
          ref="mapRef"
          :api-key="apiKey"
          map-id="car-rental-map"
          :libraries="['maps', 'marker', 'places']"
          v-model:center="center"
          v-model:zoom="zoom"
          :map-type-id="'hybrid'"
          :disable-default-ui="true"
          :map-type-control="false"
          :fullscreen-control="false"
          :zoom-control="false"
          :street-view-control="false"
          class="map-element"
          :options="mapOptions"
          @click="onMapClick"
        >
          <!-- Selected location marker -->
          <AdvancedMarker
            v-if="selectedCoords"
            :options="{ position: selectedCoords, title: 'Selected Location' }"
          />

          <!-- EV Station markers -->
          <CustomMarker
            v-for="station in stations"
            :key="station.id"
            :options="{
              position: { lat: station.lat, lng: station.lng },
              anchorPoint: 'BOTTOM_CENTER'
            }"
          >
            <div class="station-marker" @click="onMarkerClick(station)">
              <div class="station-label">{{ station.name }}</div>
              <img
                src="/icons/AdvancedMarker.svg"
                class="station-svg-pin"
                :class="{
                  'pin-busy': station.status === 'Busy',
                  'pin-closed': station.status === 'Closed' || station.isOpen === false
                }"
                :alt="station.name"
              />
            </div>
          </CustomMarker>
        </GoogleMap>
      </div>

      <!-- Floating Bottom Card -->
      <div class="bottom-sheet-container">
        <!-- Floating Current Location FAB (Bottom Right above sheet) -->
        <button
          class="find-location-fab"
          :disabled="isHardwareScanning"
          @click="selectCurrentLocation"
          aria-label="Find current location"
        >
          <ion-spinner
            v-if="isHardwareScanning"
            name="crescent"
            color="light"
            class="fab-spinner"
          ></ion-spinner>
          <ion-icon v-else :icon="locateOutline" class="fab-icon"></ion-icon>
        </button>
      </div>

      <!-- Station list modal (opens when user taps the search bar) -->
      <ModalStation :is-open="isStationModalOpen" @close="isStationModalOpen = false" />

      <!-- Station detail modal (opens when user taps a map marker) -->
      <StationDetailModal
        :is-open="isStationDetailOpen"
        :station="selectedStation"
        @close="closeStationDetail"
      />
    </ion-content>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, provide } from 'vue'
  import { GoogleMap, AdvancedMarker, CustomMarker } from 'vue3-google-map'
  
  import type { StationData } from '~/api/types'
  import { IonContent, IonSpinner, IonIcon, onIonViewWillLeave } from '@ionic/vue'
  import { locateOutline } from 'ionicons/icons'
  import SearchMap from './SearchMap.vue'
  import ModalStation from './modalStation.vue'
  import StationDetailModal from '~/components/Modal/StationDetailModal.vue'
  import { useDeviceLocation } from '~/composables/useNativeBridge'
  import IconButton from '../Button/IconButton.vue'

  defineEmits<{
    (e: 'filter-click'): void
  }>()

  const props = withDefaults(
    defineProps<{
      initialAddress?: string
      initialCoords?: { lat: number; lng: number } | null
      type?: 'pickup' | 'dropoff' | string
      title?: string
      stations?: StationData[] | any[]
    }>(),
    {
      initialAddress: '',
      initialCoords: null,
      type: 'pickup',
      title: '',
      stations: () => []
    }
  )

  const config = useRuntimeConfig()
  const apiKey = config.public.googleMapApiKey || import.meta.env.VITE_GOOGLE_MAP_API_KEY

  // Normalize stations from props to ensure valid lat & lng for markers
  const stations = computed(() => {
    const rawList = (props.stations || []) as StationData[]
    return rawList
      .map((station) => {
        const rawLat = (station as any).lat ?? station.lats
        const rawLng = (station as any).lng ?? station.longs
        const lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat))
        const lng = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng))

        // Only include stations with valid coordinates for map markers
        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
          return null
        }

        return {
          ...station,
          lat,
          lng,
          lats: String(lat),
          longs: String(lng),
          status: station.status || (station.isOpen ? 'Open' : 'Closed')
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
  })

  const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null)
  const selectedAddress = ref<string>(props.initialAddress || '')
  const isGeocoding = ref<boolean>(false)
  const { currentCoordinates, isHardwareScanning, triggerHardwareSync } = useDeviceLocation()
  const selectedCoords = ref<{ lat: number; lng: number } | null>(props.initialCoords || null)
  // Tracks the accuracy (meters) reported by the browser for the last geolocation fix,
  // so the UI can warn the user when the pin might be off by more than a trivial amount.
  const lastAccuracyMeters = ref<number | null>(null)

  // Station list modal — opened when user taps the search bar
  const isStationModalOpen = ref<boolean>(false)

  const onSearchClick = () => {
    isStationModalOpen.value = true
  }

  // Station detail modal — opened when user taps a map marker
  const isStationDetailOpen = ref<boolean>(false)
  const selectedStation = ref<any>(null)

  const route = useRoute()
  const router = useRouter()

  const onMarkerClick = (station: any) => {
    selectedStation.value = station
    isStationDetailOpen.value = true
    router.push({ hash: '#station-modal' })
  }

  const closeStationDetail = () => {
    isStationDetailOpen.value = false
    selectedStation.value = null
    if (route.hash === '#station-modal' && !route.path.includes('/qr_scan')) {
      router.back()
    }
  }

  watch(
    () => [route.path, route.hash],
    ([newPath, newHash]) => {
      if (newPath !== '/ev_charger/mapStations') {
        isStationModalOpen.value = false
        isStationDetailOpen.value = false
        selectedStation.value = null
      } else if (newHash !== '#station-modal' && isStationDetailOpen.value) {
        isStationDetailOpen.value = false
        selectedStation.value = null
      }
    }
  )

  onIonViewWillLeave(() => {
    closeStationDetail()
  })

  // Default center: Phnom Penh, Cambodia
  const center = ref<{ lat: number; lng: number }>(
    props.initialCoords || { lat: 11.5564, lng: 104.9282 }
  )
  const zoom = ref<number>(14)


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
    // "greedy" treats one-finger pan/zoom gestures directly, matching typical
    // native map UX inside a modal (no "use two fingers" cooperative overlay).
    gestureHandling: 'greedy',
    // Forces discrete integer zoom steps instead of smooth/continuous zoom.
    // Continuous zoom fires many more intermediate viewport requests during a
    // fast pinch gesture, which increases the number of in-flight requests
    // that get canceled mid-zoom (reported as net::ERR_FAILED) — a likely
    // trigger for the WebView's native error overlay.
    isFractionalZoomEnabled: false,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }))

  // Share the loaded google.maps namespace + live map instance with SearchMap.vue
  provide(
    'mapsApi',
    computed(() => mapRef.value?.api ?? null)
  )
  provide(
    'mapInstance',
    computed(() => mapRef.value?.map ?? null)
  )

  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const api = mapRef.value?.api
    if (!api) return null

    try {
      const geocoder = new api.Geocoder()
      const response = await geocoder.geocode({ address })
      const firstResult = response.results?.[0]
      if (firstResult) {
        const location = firstResult.geometry.location
        return { lat: location.lat(), lng: location.lng() }
      }
    } catch {}
    return null
  }

  async function fetchAddress(lat: number, lng: number) {
    const api = mapRef.value?.api
    if (!api) {
      selectedAddress.value = `${lat.toFixed(15)}, ${lng.toFixed(15)}`
      return
    }

    isGeocoding.value = true
    try {
      const geocoder = new api.Geocoder()
      const response = await geocoder.geocode({ location: { lat, lng } })
      const firstResult = response.results?.[0]
      if (firstResult) {
        selectedAddress.value = firstResult.formatted_address
      } else {
        selectedAddress.value = `${lat.toFixed(15)}, ${lng.toFixed(15)}`
      }
    } catch {
      selectedAddress.value = `${lat.toFixed(15)}, ${lng.toFixed(15)}`
    } finally {
      isGeocoding.value = false
    }
  }

  async function updateMarker(lat: number, lng: number) {
    selectedCoords.value = { lat, lng }
    await fetchAddress(lat, lng)
  }

  // Once the GoogleMap component reports ready, set up initial location/address if needed
  watch(
    () => mapRef.value?.ready,
    async (ready) => {
      if (!ready) return

      try {
        if (props.initialCoords) {
          center.value = props.initialCoords
          selectedCoords.value = props.initialCoords
          if (!selectedAddress.value) {
            await fetchAddress(props.initialCoords.lat, props.initialCoords.lng)
          }
          return
        }

        if (props.initialAddress) {
          const coords = await geocodeAddress(props.initialAddress)
          if (coords) {
            center.value = coords
            selectedCoords.value = coords
            selectedAddress.value = props.initialAddress
            return
          }
        }

        // Default location (Phnom Penh) without auto-locating GPS
        selectedCoords.value = center.value
        if (!selectedAddress.value) {
          await fetchAddress(center.value.lat, center.value.lng)
        }
      } catch {
        selectedCoords.value = center.value
        if (!selectedAddress.value) {
          await fetchAddress(center.value.lat, center.value.lng)
        }
      }
    },
    { immediate: true }
  )

  function onMapClick(event: any) {
    const latLng = event.latLng
    if (!latLng) return
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng
    lastAccuracyMeters.value = null
    updateMarker(lat, lng)
  }

  async function applyLocationToMap(lat: number, lng: number, accuracy?: number) {
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return

    lastAccuracyMeters.value = accuracy ?? null
    center.value = { lat, lng }
    zoom.value = 16

    const mapInstance = mapRef.value?.map
    if (mapInstance) {
      if (typeof mapInstance.panTo === 'function') {
        mapInstance.panTo({ lat, lng })
      }
      if (typeof mapInstance.setZoom === 'function') {
        mapInstance.setZoom(16)
      }
    }

    await updateMarker(lat, lng)
  }

  // Watch for asynchronous coordinates returned by the native device hardware
  watch(
    () => currentCoordinates.value,
    async (coords) => {
      if (!coords) return
      const lat = Number(coords.latitude)
      const lng = Number(coords.longitude)
      await applyLocationToMap(lat, lng, coords.accuracy)
    }
  )

  async function selectCurrentLocation() {
    try {
      // Trigger hardware sync via useDeviceLocation (requestCurrentLocation)
      await triggerHardwareSync()

      // If current coordinates are already available, center immediately
      if (currentCoordinates.value) {
        const lat = Number(currentCoordinates.value.latitude)
        const lng = Number(currentCoordinates.value.longitude)
        await applyLocationToMap(lat, lng, currentCoordinates.value.accuracy)
      }
    } catch (err: any) {
      console.error('selectCurrentLocation failed:', err)
    }
  }

  function onLocationSelected(payload: { lat: number; lng: number; address: string }) {
    lastAccuracyMeters.value = null
    selectedCoords.value = { lat: payload.lat, lng: payload.lng }
    selectedAddress.value = payload.address
    center.value = { lat: payload.lat, lng: payload.lng }
    zoom.value = 15

    const mapInstance = mapRef.value?.map
    if (mapInstance) {
      if (typeof mapInstance.panTo === 'function') {
        mapInstance.panTo({ lat: payload.lat, lng: payload.lng })
      }
      if (typeof mapInstance.setZoom === 'function') {
        mapInstance.setZoom(15)
      }
    }
  }
</script>

<style scoped>
  @import '~/assets/css/ModalMap.css';

  .location-accuracy-hint {
    font-size: 12px;
    color: var(--ion-color-medium, #92949c);
    margin-top: 4px;
  }
</style>

<style>
  /* Global Google Maps tile load error overlay suppression */
  .map-wrapper .gm-style div[style*='text-align: center'],
  .map-wrapper .gm-style div[style*='position: absolute'] > span,
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
  .map-wrapper .gm-style div[style*='background-color: rgb(229, 227, 223)'],
  .map-wrapper .gm-style div[style*='background-color: rgb(248, 249, 250)'] {
    background-color: transparent !important;
  }

  /* ---- EV Station Marker (global: AdvancedMarker slot renders outside Vue scope) ---- */
  .station-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    transform: translateY(-50%);
  }

  .station-label {
    background: rgba(255, 255, 255, 0.92);
    color: #e8690a;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 10px;
    white-space: nowrap;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    line-height: 1.4;
  }

  .station-pin {
    width: 38px;
    height: 38px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }

  /* SVG pin using AdvancedMarker.svg */
  .station-svg-pin {
    width: 31px;
    height: 44px;
    display: block;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
    transition: transform 0.15s ease;
  }

  .station-svg-pin:hover {
    transform: scale(1.15);
  }

  /* Busy: amber tint overlay via hue-rotate */
  .station-svg-pin.pin-busy {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35)) sepia(1) saturate(3) hue-rotate(-20deg)
      brightness(1.1);
  }

  /* Closed: greyscale + dimmed */
  .station-svg-pin.pin-closed {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25)) grayscale(1) opacity(0.65);
  }
</style>
