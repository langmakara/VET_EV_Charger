<script setup lang="ts">
  import camera from './camera.vue';
const router = useRouter()
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>QR Scan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- <ion-button expand="block" @click="router.push('/qr_scan/camera')">
        Open camera
      </ion-button> -->
      <camera />
    </ion-content>
  </ion-page>
</template>