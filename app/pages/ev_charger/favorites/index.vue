<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { IonPage, IonContent, onIonViewWillLeave } from '@ionic/vue'
  import StationCard from '~/components/Card/StationCard.vue'
  import evChargerData from '~/data/ev_charger_data.json'
  import StationDetailModal from '~/components/Modal/StationDetailModal.vue'

  const favoriteStations = evChargerData.nearbyStations.filter((s) => s.isFavorites)

  const isStationModalOpen = ref(false)
  const selectedStation = ref<any>(null)

  const route = useRoute()
  const router = useRouter()

  const handleFavoriteClick = (station: any) => {}

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

  onIonViewWillLeave(() => {
    closeStationModal()
  })
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
          @favorite-click="handleFavoriteClick"
          customClass="station-card"
          address="true"
          heart="true"
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
