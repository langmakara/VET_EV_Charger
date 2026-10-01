<script setup lang="ts">
  import { IonPage, IonContent } from '@ionic/vue'
  import StationCard from '~/components/Card/StationCard.vue'

  import evChargerData from '~/data/ev_charger_data.json'
  import StationDetailModal from '../StationDetailModal.vue'

  const favoriteStations = evChargerData.nearbyStations.filter((s) => s.isFavorites)

  const isStationModalOpen = ref(false)
  const selectedStation = ref<any>(null)

  const handleStationClick = (station: any) => {
    selectedStation.value = station
    isStationModalOpen.value = true
  }

  const closeStationModal = () => {
    isStationModalOpen.value = false
    selectedStation.value = null
  }
</script>

<template>
  <ion-page>
    <ion-content>
      <div class="station-scroll-container">
        <StationCard
          v-for="station in favoriteStations"
          :key="station.id"
          :station="station"
          @click="handleStationClick(station)"
          customClass="station-card"
        />
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
