<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IonPage } from '@ionic/vue'
import ModalMap from '~/components/Map/ModalMap.vue'
import ModalFilter from './modalFilter.vue'
import { useStationInfinite } from '~/composables/queries'
import type { StationData } from '~/api/types'

const isFilterOpen = ref(false)

function handleFilterClick() {
  isFilterOpen.value = true
}

// Reactive query parameters (fetch all stations for the map)
const filter = ref({
  rowsPerPage: 100
})

// Call the infinite query composable to get all stations
const { data: stationPages, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useStationInfinite(filter)

// Automatically fetch remaining pages so all stations across the region appear on map
watch(
  () => [hasNextPage?.value, isFetchingNextPage.value],
  ([hasMore, isFetching]) => {
    if (hasMore && !isFetching) {
      fetchNextPage()
    }
  }
)

// Flatten all pagination pages and extract only stations with valid lat & lng for markers
const stations = computed(() => {
  const rawList: StationData[] =
    stationPages.value?.pages.flatMap((page) => {
      const res = (page as any)?.data ?? page?.body?.data
      return Array.isArray(res) ? res : (res?.list ?? [])
    }) ?? []

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
</script>

<template>
  <ion-page>
    <ModalMap
      class="map-page"
      :stations="stations"
      @filter-click="handleFilterClick"
    />
    <ModalFilter :is-open="isFilterOpen" @close="isFilterOpen = false" />
  </ion-page>
</template>

<style scoped>
.map-page {
  background-color: white;
}
</style>
