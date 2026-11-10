<script setup lang="ts">
import { onMounted } from 'vue'
import { IonPage } from '@ionic/vue'

definePageMeta({
  redirect: '/ev_charger'
})

onMounted(() => {
  navigateTo('/ev_charger', { replace: true })
})
</script>

<template>
  <ion-page />
</template>

<style scoped>
</style>
