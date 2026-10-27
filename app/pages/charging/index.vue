<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardContent,
  IonButton
} from '@ionic/vue';
import Icon from '~/components/Icon/icon.vue';
import AlertComponent from '~/components/Modal/AlertComponent.vue';

const isStopAlertOpen = ref(false);
const isFullyChargedAlertOpen = ref(false);

const handleStopConfirm = () => {
  // TODO: Add actual stop logic
  isStopAlertOpen.value = false;
  navigateTo("/session_summary");
};

const batteryProgress = ref(70); // Dynamic progress value (0 to 100)

watch(batteryProgress, (newVal) => {
  if (newVal >= 100) {
    isFullyChargedAlertOpen.value = true;
  }
}, { immediate: true });

const handleFullyChargedConfirm = () => {
  isFullyChargedAlertOpen.value = false;
  navigateTo("/ev_charger");
};

const circumference = 251.3;
const progressOffset = computed(() => {
  return circumference - (circumference * batteryProgress.value / 100);
});

const progressColor = computed(() => {
  if (batteryProgress.value <= 20) {
    return '#C00000'; // Red for low battery
  } else if (batteryProgress.value >= 80) {
    return '#00A651'; // Solid green for full
  }
  return '#A4C214'; // Lime green for normal charging
});
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-grid class="main-grid">
        <ion-row class="ion-margin-top">
          <ion-col size="12" class="ion-text-center">
            <ion-text class="battery-label">
              <p>Battery</p>
            </ion-text>
          </ion-col>
        </ion-row>

        <ion-row style="justify-content: center;">
          <ion-col size="auto" class="progress-container">
            <svg viewBox="0 0 100 100" class="circular-progress">
              <circle cx="50" cy="50" r="40" class="bg-circle" />
              <circle cx="50" cy="50" r="40" class="progress-circle" 
                :stroke-dasharray="circumference" 
                :stroke-dashoffset="progressOffset"
                :style="{ stroke: progressColor }" />
            </svg>
            <span class="progress-inner">
              <span class="center-flash-icon">
                <Icon name="flash" size="20px" color="#A4C214" />
              </span>
              <ion-text class="progress-text">
                <span class="value">{{ batteryProgress }}</span>
                <span class="symbol">%</span>
              </ion-text>
            </span>
          </ion-col>
        </ion-row>

        <ion-row class="ion-margin-bottom">
          <ion-col size="12" class="ion-text-center">
            <ion-text class="estimated-time">
              <span>Estimated Time :</span> <span class="time-value">30 mins</span>
            </ion-text>
          </ion-col>
        </ion-row>

        <ion-row class="stats-row">
          <!-- Time Elapsed -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Time Elapsed</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-orange">
                    <Icon name="time-elapsed" size="22px" color="white" />
                  </span>
                  <ion-text class="stat-value"><span>14 mins</span></ion-text>
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <!-- Current -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Current</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-green">
                    <Icon name="current" size="22px" />
                  </span>
                  <ion-text class="stat-value"><span>60 A</span></ion-text>
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Voltage -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Voltage</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-blue">
                    <Icon name="voltage" size="22px" color="white" />
                  </span>
                  <ion-text class="stat-value"><span>500 V</span></ion-text>
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <!-- Energy -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Energy</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-red">
                    <Icon name="energy" size="22px" color="white" />
                  </span>
                  <ion-text class="stat-value"><span>6 / 15 kWh</span></ion-text>
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Estimated Cost -->
        <ion-row>
          <ion-col size="12">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Estimated Cost</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-yellow">
                    <Icon name="cost" size="22px" />
                  </span>
                  <ion-text class="stat-value"><span>៛2,000.00</span></ion-text>
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row class="footer-row ion-align-items-stretch ion-margin-top">
          <ion-col size="9" class="warning-col">
            <ion-card class="warning-card">
              <ion-card-content class="warning-content">
                <ion-row class="ion-align-items-center ion-nowrap">
                  <ion-col size="auto" class="warning-icon-col">
                    <img src="/images/don.svg" alt="Do not unplug" class="custom-warning-icon" />
                  </ion-col>
                  <ion-col>
                    <ion-text class="warning-text">
                      <span class="warning-note">Note:</span> You cannot unplug the power while charging.
                    </ion-text>
                  </ion-col>
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="3" class="stop-col ion-text-right">
            <ion-button class="stop-button" expand="block" @click="isStopAlertOpen = true">
              <span class="stop-button-content">
                <Icon name="power" size="24px" color="#E53935" class="stop-icon" />
                <ion-text class="stop-text">Stop</ion-text>
              </span>
            </ion-button>
          </ion-col>
        </ion-row>
        
      </ion-grid>

      <AlertComponent
        :is-open="isStopAlertOpen"
        type="stop"
        @cancel="isStopAlertOpen = false"
        @confirm="handleStopConfirm"
        @didDismiss="isStopAlertOpen = false"
      />

      <AlertComponent
        :is-open="isFullyChargedAlertOpen"
        type="custom"
        title="Fully Charged!"
        message="Please unplug the charger before traveling.<br>Thank you."
        label-confirm="Continue"
        hide-cancel
        outline-confirm
        @confirm="handleFullyChargedConfirm"
        @didDismiss="isFullyChargedAlertOpen = false"
      >
        <template #icon>
          <Icon name="battery-full" size="64px" color="#000000" />
        </template>
      </AlertComponent>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.main-grid {
  padding: 0;
}

.battery-label p {
  color: #8C99A8;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.progress-container {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 10px 0;
}

.circular-progress {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.bg-circle {
  fill: none;
  stroke: #E2E8F0;
  stroke-width: 12;
}

.progress-circle {
  fill: none;
  stroke-width: 12;
  stroke-linecap: butt;
  transition: stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out;
}

.progress-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.center-flash-icon {
  background-color: #558B2F;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.progress-text {
  color: #1E293B;
  display: flex;
  align-items: baseline;
}

.progress-text .value {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1px;
}

.progress-text .symbol {
  font-size: 20px;
  font-weight: 600;
  margin-left: 4px;
}

.estimated-time {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
}

.estimated-time .time-value {
  color: #009B4D;
}

.stats-row {
  margin-top: 10px;
}

.stat-card {
  margin: 0 0 12px 0;
  background: #F8FAFC;
  box-shadow: none;
  border-radius: 12px;
  padding: 0;
}
.card-content{
  padding: 10px;
}
ion-card-content {
  padding: 16px;
}

.stat-label p {
  margin: 0;
  color: #8C99A8;
  font-size: 14px;
}

.stat-row-inner {
  margin-top: 12px;
  flex-wrap: nowrap;
  gap: 12px;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-orange {
  background-color: #E65100;
}

.icon-green {
  background-color: #009B4D;
}

.icon-blue {
  background-color: #2962FF;
}

.icon-red {
  background-color: #FF3D00;
}

.icon-yellow {
  background-color: #FFB300;
}

.stat-value {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.stat-value span {
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

.bg-white {
  background-color: #FFFFFF;
}

.footer-row {
  flex-wrap: nowrap;
  gap: 12px;
}

.warning-col {
  padding: 0;
  display: flex;
}

.warning-card {
  margin: 0;
  box-shadow: none;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  background: white;
  width: 100%;
  padding: 10px;
}

.warning-content {
  padding: 0;
  display: flex;
  align-items: center;
  height: 100%;
}

.warning-icon-col {
  padding: 0 12px 0 0;
  display: flex;
  align-items: center;
}

.custom-warning-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.warning-text {
  font-size: 14px;
  line-height: 1.4;
  color: #1E293B;
  font-weight: 500;
  margin: 0;
}

.warning-note {
  color: #E53935;
  font-weight: 700;
}

.stop-col {
  padding: 0;
}

.stop-button {
  --background: #FFEAEA;
  --background-hover: #ffd6d6;
  --background-activated: #ffc2c2;
  --color: #E53935;
  --box-shadow: none;
  --border-radius: 15px;
  margin: 0;
  height: 100%;
  width: 90%;
}

.stop-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stop-icon {
  font-size: 24px;
}

.stop-text {
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
}
</style>
