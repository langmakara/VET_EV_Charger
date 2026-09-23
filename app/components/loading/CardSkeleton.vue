<script setup lang="ts">
import { IonCard, IonItem, IonThumbnail, IonLabel, IonSkeletonText } from "@ionic/vue";

interface Props {
  count?: number;
  animated?: boolean;
}

withDefaults(defineProps<Props>(), {
  count: 2,
  animated: true,
});
</script>

<template>
  <div class="skeleton-container">
    <ion-card v-for="n in count" :key="n" mode="md" class="skeleton-card">
      <ion-item lines="none">
        <ion-thumbnail slot="start">
          <ion-skeleton-text :animated="animated" style="width: 100%; height: 100%; border-radius: 10px;"></ion-skeleton-text>
        </ion-thumbnail>
        <ion-label class="ion-text-wrap">
          <h2>
            <ion-skeleton-text :animated="animated" style="width: 60%; height: 20px; border-radius: 4px;"></ion-skeleton-text>
          </h2>
          <p style="margin-top: 8px;">
            <ion-skeleton-text :animated="animated" style="width: 85%; height: 14px; border-radius: 4px;"></ion-skeleton-text>
          </p>
        </ion-label>
      </ion-item>
    </ion-card>
  </div>
</template>

<style scoped>
.skeleton-container {
  padding: 8px 0;
  width: 100%;
}

ion-card {
  border-radius: 10px;
  overflow: hidden;
}

ion-thumbnail {
  --border-radius: 10px;
  height: 72px;
  width: 110px;
}

ion-item {
  --padding-start: 0px;
  --padding-end: 0px;
  --padding-top: 0px;
  --padding-bottom: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
</style>
