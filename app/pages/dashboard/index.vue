<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <TestDoPayment />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
  import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent
  } from '@ionic/vue'
  import TestDoPayment from '~/components/Dashboard/MiniAppDashboard.vue'
</script>

