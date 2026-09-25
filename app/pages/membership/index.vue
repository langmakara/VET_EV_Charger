<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton } from '@ionic/vue';
import { computed } from 'vue';

const currentPoints = 190;
const maxPoints = 500;

const radius = 40;
const circumference = 2 * Math.PI * radius;
const progressOffset = computed(() => {
  return circumference - (circumference * currentPoints / maxPoints);
});
</script>

<template>
  <ion-page>
    <ion-header class="membership-header ion-no-border">
      <!-- <ion-toolbar class="transparent-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/ev_charger" text=""></ion-back-button>
        </ion-buttons>
      </ion-toolbar> -->

      <div class="membership-card">
        <!-- Crown Watermark -->
        <svg class="crown-watermark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="55" r="45" fill="none" stroke="white" stroke-width="8"/>
          <path d="M25 70 L30 35 L50 50 L70 35 L75 70 Z" fill="none" stroke="white" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>

        <div class="progress-section">
          <div class="progress-wrapper">
            <svg viewBox="0 0 100 100" class="circular-progress">
              <circle cx="50" cy="50" r="40" class="track-circle" />
              <circle cx="50" cy="50" r="40" class="progress-circle" 
                :stroke-dasharray="circumference" 
                :stroke-dashoffset="progressOffset" />
            </svg>
            <div class="progress-text-container">
              <span class="current-points">{{ currentPoints }}</span>
              <div class="divider"></div>
              <span class="max-points">{{ maxPoints }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
            <h1 class="tier-name">Silver</h1>
            <p class="user-id">ID: 010 993 906</p>
            <p class="expiry-text">
              20 point = 20 kWh will expires in <span class="days-left">20 days</span>
            </p>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
    </ion-content>
  </ion-page>
</template>

<style scoped>
.membership-header {
  background: linear-gradient(135deg, #FFF3E6 0%, #E3CBB8 100%);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  overflow: hidden;
  position: relative;
  box-shadow: none;
}

.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
  --box-shadow: none;
  --min-height: 44px;
}

.membership-card {
  display: flex;
  align-items: center;
  padding: 80px 10px 30px;
  position: relative;
  z-index: 1;
}

.crown-watermark {
  position: absolute;
  right: -30px;
  bottom: -20px;
  width: 180px;
  height: 180px;
  opacity: 0.15;
  z-index: -1;
}

.progress-section {
  flex-shrink: 0;
  margin-right: 10px;
}

.progress-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.circular-progress {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.track-circle {
  fill: white;
  stroke: #F8D3B3;
  stroke-width: 10;
}

.progress-circle {
  fill: none;
  stroke: #DF5E0E;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.current-points {
  font-size: 22px;
  font-weight: 800;
  color: #DF5E0E;
  line-height: 1;
  margin-top: 2px;
}

.divider {
  width: 35px;
  height: 1.5px;
  background-color: #1F232D;
  margin: 4px 0;
}

.max-points {
  font-size: 15px;
  color: #6C7280;
  line-height: 1;
}

.details-section {
  flex: 1;
}

.tier-name {
  font-size: 35px;
  font-weight: 900;
  color: #1F232D;
  margin: 0 0 6px 0;
  line-height: 1;
}

.user-id {
  font-size: 14px;
  color: #8C92A0;
  margin: 0 0 6px 0;
}

.expiry-text {
  font-size: 12px;
  color: #8C92A0;
  margin: 0;
  line-height: 1.4;
}

.days-left {
  color: #00A651;
}
</style>