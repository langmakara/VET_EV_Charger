<script setup lang="ts">
import { IonCard, IonItem, IonThumbnail, IonLabel, IonGrid, IonRow, IonCol, IonText } from '@ionic/vue';
import Icon from '~/components/Icon/icon.vue';

defineProps({
  station: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <ion-card class="station-card" style="background: #f8fafc;">
    <ion-item lines="none" class="station-item">
      <ion-thumbnail slot="start" class="station-thumbnail">
        <img :src="station.image" :alt="station.name" />
      </ion-thumbnail>
      
      <ion-label class="station-info ion-text-wrap">
        <ion-grid class="info-grid">
          <ion-row class="info-header ion-align-items-center ion-justify-content-between">
            <ion-col size="9">
              <ion-text color="dark">
                <h3 class="station-name">{{ station.name }}</h3>
              </ion-text>
            </ion-col>
            <ion-col size="3">
              <ion-text :color="station.status === 'Open' ? 'success' : 'danger'" class="station-status">
                • {{ station.status }}
              </ion-text>
            </ion-col>
          </ion-row>
          
          <ion-row class="info-row">
            <ion-col size="3" class="info-item">
              <Icon name="plug" class="info-icon" size="14px" />
              <ion-text color="medium">DC </ion-text>
              <ion-text class="highlight">{{ station.dc }}</ion-text>
            </ion-col>
            <ion-col size="9" class="info-item">
              <Icon name="dollar" class="info-icon" size="14px" />
              <ion-text color="medium">Start from </ion-text>
              <ion-text class="highlight">{{ station.price }}</ion-text>
            </ion-col>
          </ion-row>
          
          <ion-row class="info-row">
            <ion-col size="4" class="info-item">
              <Icon name="gbt" class="info-icon" size="14px" />
              <ion-text color="medium">GB/T </ion-text>
              <ion-text class="highlight">{{ station.gbt }}</ion-text>
            </ion-col>
            <ion-col size="8" class="info-item">
              <Icon name="ccs2" class="info-icon" size="14px" />
              <ion-text color="medium">CCS2 (DC) </ion-text>
              <ion-text class="highlight">{{ station.ccs2 }}</ion-text>
            </ion-col>
          </ion-row>
          
          <ion-row class="info-row location-row ion-align-items-center" style="width: 100%;">
            <ion-col size="auto" class="info-item location-item" style="display: flex; align-items: center; padding: 0;">
              <Icon name="location" class="location-icon" size="14px" style="margin-right: 4px; display: flex;" />
              <ion-text color="primary" class="location-text" style="line-height: 1;">Get Direction</ion-text>
            </ion-col>
            <ion-col style="display: flex; align-items: center; padding: 0;">
              <ion-text color="medium" class="distance-text" style="line-height: 1;">{{ station.distance }}</ion-text>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-label>
    </ion-item>
  </ion-card>
</template>

<style scoped>
.station-card {
  width: 350px;
  min-width: 325px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  margin: 0;
  padding: 0 !important;
  overflow: hidden;
}

.station-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --background: transparent;
  --min-height: 120px;
}

.station-thumbnail {
  width: 100px;
  height: 120px;
  margin: 0;
}

.station-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.station-info {
  margin: 0;
  height: 120px;
}

.info-grid {
  padding: 8px 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  --ion-grid-padding: 0;
  --ion-grid-column-padding: 0;
}

ion-col {
  padding: 0;
}

.info-header {
  margin-bottom: 4px;
}

.station-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.station-status {
  font-size: 12px;
  font-weight: 600;
}

.info-row {
  font-size: 11px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
}

.info-icon {
  color: #64748b;
}

.highlight {
  color: #e85d04;
}

.location-row {
  margin-top: auto;
  gap: 4px;
}

.location-item {
  cursor: pointer;
}

.location-icon {
  color: #3b82f6;
}

.location-text {
  font-weight: 500;
  color: #3b82f6;
}

.distance-text {
  font-size: 11px;
}
</style>
