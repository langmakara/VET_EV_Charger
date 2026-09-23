<script setup lang="ts">
import { IonCard } from '@ionic/vue';

defineProps({
  bgColor: {
    type: String,
    default: 'white' // Allows passing 'linear-gradient(...)' or plain colors
  },
  customClass: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <ion-card class="app-card" :class="customClass" :style="{ background: bgColor }">
    <slot></slot>
  </ion-card>
</template>

<style scoped>
.app-card {
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
</style>
