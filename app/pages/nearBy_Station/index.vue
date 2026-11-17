<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import {
    IonPage,
    IonContent,
    IonSpinner,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  } from '@ionic/vue'
  import { useRoute, useRouter } from 'vue-router'
  import StationCard from '~/components/Card/StationCard.vue'
  import StationDetailModal from '~/components/Modal/StationDetailModal.vue'
  import { useStationInfinite } from '~/composables/queries'
  import { useDeviceLocation } from '~/composables/useNativeBridge'
  import type { StationData } from '~/api/types'

  const route = useRoute()
  const router = useRouter()

  const { currentCoordinates, triggerHardwareSync } = useDeviceLocation()

  // Reactive query parameters (filter payload for POST /station/list)
  const filter = ref({
    rowsPerPage: 20,
    ...(currentCoordinates.value?.latitude && currentCoordinates.value?.longitude
      ? {
          lats: Number(currentCoordinates.value.latitude),
          longs: Number(currentCoordinates.value.longitude)
        }
      : {})
  })

  // Watch for coordinate updates
  watch(
    () => currentCoordinates.value,
    (coords) => {
      if (coords?.latitude && coords?.longitude) {
        const lat = Number(coords.latitude)
        const lng = Number(coords.longitude)
        if (!isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
          filter.value = {
            ...filter.value,
            lats: lat,
            longs: lng
          }
        }
      }
    },
    { immediate: true }
  )

  const isFilterReady = computed(() => {
    const lat = Number(filter.value.lats)
    const lng = Number(filter.value.longs)
    return !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)
  })

  // Call the infinite query composable
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useStationInfinite(filter, { enabled: isFilterReady })

  // Flatten all pagination pages into a single station list
  const rawStations = computed<StationData[]>(() => {
    return (
      data.value?.pages.flatMap((page) => {
        const res = (page as any)?.data ?? page?.body?.data
        return Array.isArray(res) ? res : (res?.list ?? [])
      }) ?? []
    )
  })

  // Map backend fields so StationCard displays images & status properly
  const stations = computed(() => {
    return rawStations.value.map((s) => ({
      ...s,
      // StationCard uses station.station for thumbnail
      station: s.imageUrl,
      status: s.isOpen ? 'Open' : 'Closed',
      price: s.pricePerKwh ? `${s.pricePerKwh.toLocaleString()} KHR/kWh` : '',
      distance: s.value ? `${Number(s.value).toFixed(1)} km` : ''
    }))
  })

  // 5. Handle infinite scroll when user scrolls to bottom
  const loadMore = async (event: CustomEvent) => {
    if (hasNextPage?.value) {
      await fetchNextPage()
    }
    ;(event.target as HTMLIonInfiniteScrollElement).complete()
  }

  // Modal handling
  const isStationModalOpen = ref(false)
  const selectedStation = ref<any>(null)

  const handleStationClick = (station: any) => {
    selectedStation.value = station
    isStationModalOpen.value = true
    router.push({ hash: '#station-modal' })
  }

  const closeStationModal = () => {
    isStationModalOpen.value = false
    selectedStation.value = null
    if (route.hash === '#station-modal') {
      router.back()
    }
  }

  watch(
    () => route.hash,
    (newHash) => {
      if (newHash !== '#station-modal' && isStationModalOpen.value) {
        isStationModalOpen.value = false
        selectedStation.value = null
      }
    }
  )
</script>

<template>
  <ion-page>
    <ion-content>
      <!-- Loading indicator -->
      <div v-if="isLoading" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-spinner name="crescent" />
      </div>

      <!-- Error state -->
      <div v-else-if="isError" class="ion-text-center ion-padding">
        <ion-text color="danger">{{ error?.message || $t('nearbyStation.failedLoadStations') }}</ion-text>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="stations.length === 0"
        class="ion-text-center ion-padding"
        style="margin-top: 40px"
      >
        <ion-text color="medium">{{ $t('nearbyStation.noStationsNearby') }}</ion-text>
      </div>

      <!-- Station List -->
      <div v-else class="station-scroll-container">
        <StationCard
          v-for="station in stations"
          :key="station.id"
          :station="station"
          customClass="station-card"
          @click="handleStationClick(station)"
        />

        <!-- Ionic Infinite Scroll for Next Pages -->
        <ion-infinite-scroll :disabled="!hasNextPage" @ionInfinite="loadMore">
          <ion-infinite-scroll-content
            loading-spinner="crescent"
            :loading-text="$t('evCharger.loadingMoreStations')"
          />
        </ion-infinite-scroll>
      </div>

      <StationDetailModal
        :is-open="isStationModalOpen"
        :station="selectedStation"
        @close="closeStationModal"
      />
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .station-card {
    margin-bottom: 10px;
    width: 100%;
  }
</style>
