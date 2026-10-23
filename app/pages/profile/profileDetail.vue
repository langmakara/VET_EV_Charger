<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonContent,
  IonToast
} from '@ionic/vue';
import Icon from '~/components/Icon/icon.vue';
import { sendTitleToFlutter } from '~/composables/useNativeBridge';
import evChargerData from '~/data/ev_charger_data.json';

onMounted(() => {
  sendTitleToFlutter('Profile Details');
});

// Profile user data from centralized JSON
const { profile } = evChargerData;
const user = ref({
  fullName: profile.fullName,
  email: profile.email,
  address: profile.address,
  phoneNumber: profile.phoneNumber,
  avatar: profile.avatar
});

// Toast feedback
const showToast = ref(false);
const toastMessage = ref('');

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
};

const handleCameraClick = () => {
  triggerToast('Change profile photo');
};
</script>

<template>
  <ion-page>
    <ion-content class="profile-detail-content" :fullscreen="true">
      <div class="detail-container">
        <!-- 1. Centered Avatar with Camera Badge -->
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <div class="avatar-image-box">
              <img :src="user.avatar" :alt="user.fullName" class="avatar-img" />
            </div>
            <button
              type="button"
              class="camera-btn"
              @click="handleCameraClick"
              aria-label="Change profile photo"
            >
              <Icon name="camera" size="15px" color="#64748b" />
            </button>
          </div>
        </div>

        <!-- 2. Profile Information Rows -->
        <div class="info-list">
          <!-- Full Name -->
          <div class="info-row">
            <div class="info-left">
              <Icon name="user" size="20px" class="info-icon" />
              <span class="info-label">Full name</span>
            </div>
            <span class="info-value">{{ user.fullName }}</span>
          </div>

          <!-- Email -->
          <div class="info-row">
            <div class="info-left">
              <Icon name="at" size="20px" class="info-icon" />
              <span class="info-label">Email</span>
            </div>
            <span class="info-value">{{ user.email }}</span>
          </div>

          <!-- Address -->
          <div class="info-row">
            <div class="info-left">
              <Icon name="location" size="20px" class="info-icon" />
              <span class="info-label">Address</span>
            </div>
            <span class="info-value">{{ user.address }}</span>
          </div>

          <!-- Phone Number -->
          <div class="info-row no-border">
            <div class="info-left">
              <Icon name="phone" size="20px" class="info-icon" />
              <span class="info-label">Phone Number</span>
            </div>
            <span class="info-value">{{ user.phoneNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Feedback Toast -->
      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="1800"
        position="bottom"
        @did-dismiss="showToast = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.profile-detail-content {
  --background: #ffffff;
  background: #ffffff;
}

.detail-container {
  width: 100%;
  padding: 36px 20px 24px 20px;
  box-sizing: border-box;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 34px;
}

.avatar-wrapper {
  position: relative;
  width: 86px;
  height: 86px;
}

.avatar-image-box {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.camera-btn {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.camera-btn:active {
  transform: scale(0.92);
  background-color: #f8fafc;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 18px 4px;
  border-bottom: 1px solid #edf2f7;
}

.info-row.no-border {
  border-bottom: none;
}

.info-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.info-icon {
  color: #55647a;
  flex-shrink: 0;
}

.info-label {
  font-size: 15px;
  font-weight: 500;
  color: #2b3547;
  letter-spacing: -0.2px;
}

.info-value {
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
  letter-spacing: -0.1px;
}
</style>