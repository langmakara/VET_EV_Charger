<script setup lang="ts">
const props = defineProps({
  error: Object
});

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <IonApp>
    <ion-page>
      <ion-header class="ion-no-border">
        <ion-toolbar color="primary">
          <ion-title>Error</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding ion-text-center">
        <h2>Something went wrong</h2>
        <p v-if="error">{{ error.statusCode }} - {{ error.message }}</p>
        <ion-button color="primary" @click="handleError">Go Home</ion-button>
      </ion-content>
    </ion-page>
  </IonApp>
</template>
