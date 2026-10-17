
<script setup lang="ts">
import { ref } from 'vue'
import { IonPage } from '@ionic/vue'
import ModalMap from '~/components/Map/ModalMap.vue'
import ModalFilter from './modalFilter.vue'

const isFilterOpen = ref(false)

function handleFilterClick() {
  isFilterOpen.value = true
}
</script>

<template>
  <ion-page>
    <ModalMap class="map-page" @filter-click="handleFilterClick" />
    <ModalFilter :is-open="isFilterOpen" @close="isFilterOpen = false" />
  </ion-page>
</template>

<style scoped>
.map-page {
  background-color: white;
}
</style>