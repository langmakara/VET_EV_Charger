<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    IonPage,
    IonContent,
    IonSpinner,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    onIonViewWillLeave
  } from '@ionic/vue'
  import StationCard from '~/components/Card/StationCard.vue'
  import StationDetailModal from '~/components/Modal/StationDetailModal.vue'
  import { useStationInfinite } from '~/composables/queries'
  import type { StationData } from '~/api/types'

  const route = useRoute()
  const router = useRouter()

  const isStationModalOpen = ref(false)
  const selectedStation = ref<StationData | null>(null)

  // Filter parameters for station list
  const filter = ref({
    rowsPerPage: 20
  })

  // Infinite query for stations
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useStationInfinite(filter)

  // Flatten all pagination pages
  const rawStations = computed<StationData[]>(() => {
    return (
      data.value?.pages.flatMap((page) => {
        const res = (page as any)?.data ?? page?.body?.data
        return Array.isArray(res) ? res : res?.list ?? []
      }) ?? []
    )
  })

  // Filter only favorite stations
  const favoriteStations = computed<StationData[]>(() => {
    return rawStations.value.filter((s) => Boolean(s.isFavorite ?? (s as any).isFavorites))
  })

  const loadMore = async (event: any) => {
    if (hasNextPage.value && !isFetchingNextPage.value) {
      await fetchNextPage()
    }
    event?.target?.complete()
  }

  const handleStationClick = (station: StationData) => {
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

  onIonViewWillLeave(() => {
    closeStationModal()
  })
</script>

<template>
  <ion-page>
    <ion-content>
      <!-- Loading indicator -->
      <div v-if="isLoading" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-spinner name="crescent" />
      </div>

      <!-- Error state -->
      <div v-else-if="isError" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-text color="danger">{{ error?.message || 'Failed to load favorite stations.' }}</ion-text>
      </div>

      <!-- Empty state -->
      <div v-else-if="favoriteStations.length === 0" class="ion-text-center ion-padding" style="margin-top: 60px">
        <ion-text color="medium">No favorite stations found.</ion-text>
      </div>

      <!-- Station List -->
      <div v-else>
        <StationCard
          v-for="station in favoriteStations"
          :key="station.id"
          :station="station"
          customClass="station-card"
          address="true"
          heart="true"
          @click="handleStationClick(station)"
        />

        <!-- Infinite Scroll -->
        <ion-infinite-scroll :disabled="!hasNextPage" @ionInfinite="loadMore">
          <ion-infinite-scroll-content
            loading-spinner="crescent"
            loading-text="Loading more stations..."
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

