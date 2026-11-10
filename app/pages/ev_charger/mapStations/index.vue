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

// Flatten all pagination pages into a single station list (ModalMap normalizes coords)
const stations = computed<StationData[]>(() =>
  stationPages.value?.pages.flatMap((page) => {
    const res = (page as any)?.data ?? page?.body?.data
    return Array.isArray(res) ? res : (res?.list ?? [])
  }) ?? []
)
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
