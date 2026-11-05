<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { IonModal, IonContent, onIonViewWillLeave } from '@ionic/vue'
  import { useRoute, useRouter } from 'vue-router'
  import StationCard from '~/components/Card/StationCard.vue'
  import StationDetailModal from '~/components/Modal/StationDetailModal.vue'
  import evChargerData from '~/data/ev_charger_data.json'
  import type { GunTypeData, StationData } from '~/api/types'
  import { useGunTypeQuery, useStationInfinite } from '~/composables/queries'

  const props = defineProps<{
    isOpen: boolean
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  // Station list from JSON data
  // Reactive query parameters (filter payload for POST /station/list)
  const filter = ref({
    rowsPerPage: 20
  })

  // Call the infinite query composable
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useStationInfinite(filter)

  // Flatten all pagination pages into a single station list
  const Stations = computed<StationData[]>(() => {
    return (
      data.value?.pages.flatMap((page) => {
        const res = (page as any)?.data ?? page?.body?.data
        return Array.isArray(res) ? res : (res?.list ?? [])
      }) ?? []
    )
  })

  // Station detail modal state
  const isStationModalOpen = ref(false)
  const selectedStation = ref<any>(null)

  const route = useRoute()
  const router = useRouter()

  const handleClose = () => {
    emit('close')
  }

  const handleStationClick = (station: any) => {
    selectedStation.value = station
    isStationModalOpen.value = true
    router.push({ hash: '#station-modal' })
  }

  const closeStationModal = () => {
    isStationModalOpen.value = false
    selectedStation.value = null
    if (route.hash === '#station-modal' && !route.path.includes('/qr_scan')) {
      router.back()
    }
  }

  watch(
    () => [route.path, route.hash],
    ([newPath, newHash]) => {
      if (newPath !== '/ev_charger/mapStations') {
        emit('close')
        isStationModalOpen.value = false
        selectedStation.value = null
      } else if (newHash !== '#station-modal' && isStationModalOpen.value) {
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
  <!-- Station list bottom sheet -->
  <ion-modal
    :is-open="isOpen"
    mode="ios"
    :initial-breakpoint="0.5"
    :breakpoints="[0, 0.5, 1]"
    :handle="true"
    @didDismiss="handleClose"
    class="station-list-modal"
  >
    <ion-content class="station-list-content">
      <div class="drag-handle" />

      <div class="modal-list-header">
        <span class="modal-list-title">{{ $t('evCharger.nearbyStations') }}</span>
        <span class="station-count">{{ $t('evCharger.stationsCount', { count: Stations.length }) }}</span>
      </div>

      <div class="station-scroll-container">
        <StationCard
          v-for="station in Stations"
          :key="station.id"
          :station="station"
          customClass="station-card"
          @click="handleStationClick(station)"
          address="true"
          heart="true"
        />
      </div>
    </ion-content>
  </ion-modal>

  <!-- Station detail modal (outside the list modal to avoid nesting) -->
  <StationDetailModal
    :is-open="isStationModalOpen"
    :station="selectedStation"
    @close="closeStationModal"
  />
</template>

<style scoped>
  .station-card {
    margin-bottom: 10px;
    width: 100%;
  }

  .station-list-modal {
    --border-radius: 20px 20px 0 0;
  }

  .station-list-content {
    --background: #f8fafc;
    --padding-top: 0;
    --padding-start: 0;
    --padding-end: 0;
    --padding-bottom: 16px;
  }

  .drag-handle {
    width: 40px;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    margin: 12px auto 8px;
  }

  .modal-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px 12px;
  }

  .modal-list-title {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }

  .station-count {
    font-size: 13px;
    color: #94a3b8;
  }

  .station-scroll-container {
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
