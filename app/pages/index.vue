<script setup lang="ts">
import EvChargerPage from "./ev_charger/index.vue";
</script>

<template>
  <EvChargerPage />
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--ion-color-medium);
}
</style>
