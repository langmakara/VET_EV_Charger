<script setup lang="ts">
import {
  IonModal,
  IonContent,
  IonIcon
} from "@ionic/vue";
import { heartOutline, closeOutline, flashOutline, locationOutline, arrowUpOutline, timeOutline, callOutline, paperPlaneOutline, chatbubbleEllipsesOutline, checkmarkOutline, arrowRedoOutline } from 'ionicons/icons';
import Icon from '~/components/Icon/icon.vue';

defineProps<{
  isOpen: boolean;
  station: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <ion-modal :is-open="isOpen" mode="ios" @didDismiss="handleClose" class="custom-station-modal">
    <ion-content class="station-modal-bg">
      <!-- Header Image -->
      <div class="modal-header-image" :style="{ backgroundImage: `url(${ station?.image})` }">
        <div class="modal-top-bar">
          <span class="modal-title-overlay">{{ station?.name }}</span>
          <div class="modal-top-actions">
            <button class="circle-btn translucent">
              <ion-icon :icon="heartOutline" />
            </button>
            <button class="circle-btn translucent" @click="handleClose">
              <ion-icon :icon="closeOutline" />
            </button>
          </div>
        </div>
        <div class="modal-header-stats">
          <div class="stat-pill">
            <Icon name="station" class="stat-icon" size="14px" /> {{ station?.stationCount }}
            <span class="stat-divider">|</span>
            <Icon name="plug" class="stat-icon" size="14px" /> {{ station?.plugCount }}
            <span class="stat-divider">|</span>
            <ion-icon :icon="locationOutline" class="stat-icon"/> {{ station?.distance }}
          </div>
        </div>
      </div>
      
      <div class="modal-body-custom">
        <!-- Title & Subtitle -->
        <div class="station-title-row">
          <div class="logo-circle bg-orange">
            <span class="logo-text">
              <img v-if="station?.profile" :src="station?.profile" :alt="station?.name" />
            </span>
          </div>
          <div class="title-text">
            <h2>{{ station?.name }}</h2>
            <p>{{ station?.type }}</p>
          </div>
        </div>
        
        <!-- Location Pill -->
        <div class="location-pill">
          <ion-icon :icon="arrowUpOutline" class="loc-icon" />
          <span>{{ station?.location }}</span>
        </div>
        
        <!-- Charge Point Info -->
        <div class="section-heading">Charge Point Info</div>
        
        <!-- Open Status Card -->
        <div class="info-card flex-row status-card">
          <ion-icon :icon="timeOutline" class="clock-icon" />
          <span class="status-text"><span class="text-green">{{ station?.status }}</span> {{ station?.hours }}</span>
        </div>
        
        <!-- Detailed Chargers Card -->
        <div class="info-card chargers-card">
          <template v-for="(connector, index) in station?.connectors" :key="index">
            <div class="connector-row">
              <div class="connector-left">
                <div class="connector-icon-wrapper">
                  <Icon :name="connector.icon" size="24px" />
                </div>
                <span class="connector-name">{{ connector.name }}</span>
              </div>
              <div class="connector-mid">
                <div class="power-info"><ion-icon :icon="flashOutline" /> {{ connector.power }}</div>
                <div class="price-info"><ion-icon :icon="flashOutline" /> {{ connector.price }}</div>
              </div>
              <div class="connector-right">
                <span class="text-orange">{{ connector.status }}</span>
              </div>
            </div>
            <div v-if="station?.connectors && index !== station.connectors.length - 1" class="hr-divider"></div>
          </template>
          
          <div class="hr-divider"></div>
          
          <!-- Operator & Actions -->
          <div class="operator-row">
            <div class="operator-left">
              <div class="logo-circle small-logo bg-orange">
                <span class="logo-text-small">
                  <img v-if="station?.profile" :src="station?.profile" :alt="station?.name" />
                </span>
              </div>
              <div class="operator-info">
                <span class="op-label">Operated by</span>
                <span class="op-name">{{ station?.operator }}</span>
              </div>
            </div>
            <div class="operator-actions">
              <button 
                v-for="(contact, index) in station?.contacts" 
                :key="index"
                :class="['action-circle', contact.colorClass]"
              >
                <Icon :name="contact.icon" size="16px" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Amenities -->
        <div class="section-heading">Amenities</div>
        <div class="info-card amenities-card">
          <div class="amenities-grid">
            <div class="amenity-item" v-for="(amenity, index) in station?.amenities" :key="index">
              <ion-icon :icon="checkmarkOutline" class="text-green check-icon" /> {{ amenity }}
            </div>
          </div>
        </div>
        
        <!-- Surroundings -->
        <div class="section-heading">Surroundings</div>
        <div class="info-card flex-between surroundings-card" v-for="(surrounding, index) in station?.surroundings" :key="index">
          <div class="amenity-item"><ion-icon :icon="checkmarkOutline" class="text-green check-icon" /> {{ surrounding }}</div>
          <button class="direction-btn"><ion-icon :icon="arrowRedoOutline" /></button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
/* Custom Modal Styles for New Design */
.custom-station-modal {
  --border-radius: 20px 20px 0 0;
  padding: 0;
}
.station-modal-bg {
  --background: #f8fafc;
  --padding-top: 0px;
  --padding-bottom: 0px;
  --padding-start: 0px;
  --padding-end: 0px;
}
.modal-header-image {
  position: relative;
  width: 100%;
  height: 220px;
  background-size: cover;
  background-position: center;
}
.modal-top-bar {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title-overlay {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
.modal-top-actions {
  display: flex;
  gap: 8px;
}
.circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: white;
  font-size: 18px;
}
.circle-btn.translucent {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
}
.modal-header-stats {
  position: absolute;
  bottom: 12px;
  right: 12px;
}
.stat-pill {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: white;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-icon {
  font-size: 14px;
}
.stat-divider {
  color: rgba(255,255,255,0.4);
}
.modal-body-custom {
  padding: 10px;
  padding-bottom: 40px;
  background: #f8fafc;
}
.station-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.logo-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
.bg-orange {
  background: #e85d04;
}
.logo-text {
  font-size: 16px;
}
.logo-text-small {
  font-size: 12px;
}
.small-logo {
  width: 36px;
  height: 36px;
}
.title-text h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1e293b;
}
.title-text p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}
.location-pill {
  background: white;
  border-radius: 20px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.loc-icon {
  font-size: 18px;
  color: #64748b;
}
.section-heading {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
  margin-left: 4px;
}
.info-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.flex-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.clock-icon {
  font-size: 20px;
  color: #64748b;
}
.status-text {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.text-green {
  color: #10b981;
}
.text-orange {
  color: #e85d04;
  font-weight: 700;
}
.connector-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.connector-left {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 45%;
}
.connector-icon-wrapper {
  color: #1e293b;
}
.connector-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.connector-mid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 35%;
}
.power-info, .price-info {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}
.connector-right {
  font-size: 15px;
  width: 20%;
  text-align: right;
}
.hr-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 16px 0;
}
.operator-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.operator-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.operator-info {
  display: flex;
  flex-direction: column;
}
.op-label {
  font-size: 11px;
  color: #94a3b8;
}
.op-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.operator-actions {
  display: flex;
  gap: 8px;
}
.action-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: white;
  font-size: 16px;
}
.bg-gray-btn { background: #f1f5f9; color: #1e293b; border: 1px solid #e2e8f0; }
.bg-blue-btn { background: #0ea5e9; }
.bg-messenger-btn { background: #3b82f6; }
.amenities-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #334155;
}
.check-icon {
  font-size: 16px;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.direction-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  border: none;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
</style>
