<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage,
  IonContent,
  IonCardContent,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonGrid,
  IonRow,
  IonCol,
  IonCard
} from "@ionic/vue";
import AppCard from "~/components/Card/AppCard.vue";
import AppButton from "~/components/Button/AppButton.vue";
import Icon from "~/components/Icon/icon.vue";
import SectionHeader from "~/components/SectionHeader.vue";
import StationDetailModal from "./StationDetailModal.vue";
import StationCard from "~/components/Card/StationCard.vue";

import evChargerData from "~/data/ev_charger_data.json";

const { actions, nearbyStations, newsFeeds } = evChargerData;

const handleViewDetail = () => {
  navigateTo('/charging');
};

const handleAction = (action: any) => {
  console.log('Clicked action:', action.label);
  // You can route to different pages based on action.label here
};

const handlePointsClick = () => {
  navigateTo('/membership');
};

const isStationModalOpen = ref(false);
const selectedStation = ref<any>(null);

const handleStationClick = (station: any) => {
  selectedStation.value = station;
  isStationModalOpen.value = true;
};

const closeStationModal = () => {
  isStationModalOpen.value = false;
  selectedStation.value = null;
};
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      
      <!-- Charging Card -->
      <AppCard bgColor="linear-gradient(135deg, #f8e9e1, #ead1c5)">
        <ion-card-content>
          <div class="card-header">
            <div class="icon-circle">
              <Icon name="flash" class="flash-icon" />
            </div>
            <span class="status-text">Your vehicle is charging</span>
          </div>
          <div class="card-body">
            <img src="/img/blue_ev_charging.jpg" alt="Charging EV" class="car-image" />
            <div class="button-container">
              <AppButton size="small" fill="solid" @click="handleViewDetail()">
                View Detail
              </AppButton>
            </div>
          </div>
        </ion-card-content>
      </AppCard>

      <!-- Points Card -->
      <AppCard bgColor="linear-gradient(135deg, #f8e9e1, #ead1c5)" customClass="points-card" button="true" @click="handlePointsClick">
        <img src="/img/Crown.svg" alt="Crown" class="bg-crown" />
        <ion-card-content class="points-card-content">
          <div class="points-header">
            <div class="points-label">Total Points</div>
            <div class="points-value">190 pts</div>
          </div>
          <div class="button-container-right">
            <AppButton size="small" fill="solid">
              <Icon name="HistoryIcon" class="btn-icon" />
              History
            </AppButton>
          </div>
        </ion-card-content>
      </AppCard>

      <!-- Action Grid -->
      <ion-grid class="action-grid">
        <ion-row>
          <ion-col v-for="action in actions" :key="action.label">
            <AppCard customClass="action-card" button="true" @click="handleAction(action)">
              <ion-card-content class="action-content">
                <div class="action-icon-wrapper">
                  <Icon :name="action.icon" class="action-icon" size="18px" />
                </div>
                <div class="action-label">{{ action.label }}</div>
              </ion-card-content>
            </AppCard>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Nearby Station Section -->
      <SectionHeader title="Nearby Station" @view-all="() => console.log('View all stations clicked')" />
      <div class="station-scroll-container">
        <StationCard 
          v-for="station in nearbyStations" 
          :key="station.id" 
          :station="station" 
          @click="handleStationClick(station)" 
        />
      </div>

      <!-- News feed Section -->
      <SectionHeader title="News feed" @view-all="() => console.log('View all news clicked')" />
      
      <ion-card class="news-card" v-for="news in newsFeeds" :key="news.id">
        <ion-item lines="none" class="news-item">
          <ion-thumbnail slot="start" class="news-thumbnail">
            <img :alt="news.title" :src="news.image" />
          </ion-thumbnail>
          <ion-label class="ion-text-wrap news-label">
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-desc">{{ news.description }}</p>
          </ion-label>
        </ion-item>
      </ion-card>

      <!-- Station Details Modal -->
      <StationDetailModal
        :is-open="isStationModalOpen"
        :station="selectedStation"
        @close="closeStationModal"
      />

    </ion-content>
  </ion-page>
</template>

<style scoped>
/* Action Grid Styles */
.action-grid {
  padding: 0;
  margin-top: 16px;
}

/* Horizontal Scroll Container */
.station-scroll-container {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.station-scroll-container::-webkit-scrollbar {
  display: none;
}

/* Charging Card Styles */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.icon-circle {
  width: 20px;
  height: 20px;
  background-color: #55a83b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flash-icon {
  color: white;
  font-size: 18px;
}
.status-text {
  font-size: 14px;
  color: #7b889a;
  font-weight: 500;
}
.card-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.car-image {
  width: 230px;
  height: 100px;
  object-fit: cover;
  mix-blend-mode: multiply;
  margin-bottom: -10px;
}
.button-container {
  text-align: right;
  margin-top: 10px;
}
ion-card-content {
  padding: 0;
}

/* Points Card Styles */
.points-card {
  position: relative;
  overflow: hidden;
}
.bg-crown {
  position: absolute;
  top: -20px;
  right: -10px;
  width: 80px;
  z-index: 0;
}
.points-card-content {
  padding: 0;
  position: relative;
  z-index: 1;
}
.points-header {
  display: flex;
  flex-direction: column;
}
.points-label {
  font-size: 16px;
  color: #7b889a;
  margin-left: 8px;
}
.points-value {
  font-size: 28px;
  font-weight: 800;
  color: #2c323f;
  margin-left: 8px;
}
.button-container-right {
  display: flex;
  justify-content: flex-end;
}
.btn-icon {
  margin-right: 6px;
  font-size: 20px;
}

/* Action Card Styles */
.action-card {
  margin: 0;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
}
.action-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
}
.action-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e85d04;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.action-icon {
  color: white;
}
.action-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

/* News Card Styles */
.news-card {
  box-shadow: none;
  margin-bottom: 10px;
  padding: 0 !important;
  border-radius: 15px !important;
}

.news-item {
  --padding-start: 12px;
  --inner-padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --background: transparent;
}

.news-thumbnail {
  width: 80px;
  height: 60px;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 12px;
}

.news-thumbnail img {
  border-radius: 8px;
  object-fit: cover;
}

.news-label {
  margin: 0;
}

.news-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.news-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


</style>