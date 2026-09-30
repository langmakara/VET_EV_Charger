
<script setup lang="ts">
import {IonPage} from '@ionic/vue'
import ModalMap from '~/components/Map/ModalMap.vue';
</script>

<template>
  <ion-page>
    <ModalMap class="map-page"/>
  </ion-page>
</template>
<style scoped>
.map-page {
  background-color: white;
}
</style>