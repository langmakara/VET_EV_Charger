<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonContent,
  IonAvatar,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonToast
} from '@ionic/vue';
import { chevronForward } from 'ionicons/icons';
import Icon from '~/components/Icon/icon.vue';
import ContactModal from './contactModal.vue';
import { sendTitleToFlutter } from '~/composables/useNativeBridge';

onMounted(() => {
  sendTitleToFlutter('Profile');
});

// User information from centralized data
// Profile user data from useUserProfile with fallback to centralized JSON
const { userProfile} = useUserProfile();

const user = computed(() => ({
  fullName: userProfile.value?.fullName,
  email: userProfile.value?.email,
  address: userProfile.value?.address,
  phoneNumber: userProfile.value?.phoneNumber,
  avatar: userProfile.value?.avatar
}));

// Language definitions
interface LanguageOption {
  code: string;
  label: string;
  toastText: string;
}

const languages: LanguageOption[] = [
  { code: 'km', label: 'ភាសាខ្មែរ', toastText: 'បានប្តូរទៅភាសាខ្មែរ' },
  { code: 'en', label: 'English', toastText: 'Language changed to English' },
  { code: 'zh', label: '中国人', toastText: '语言已切换为中国人' }
];

const selectedLanguageCode = ref('en');
const isLanguageModalOpen = ref(false);
const isContactModalOpen = ref(false);

const currentLanguage = computed(() => {
  return languages.find((l) => l.code === selectedLanguageCode.value) || languages[1];
});

const selectLanguage = (lang: LanguageOption) => {
  selectedLanguageCode.value = lang.code;
  setTimeout(() => {
    isLanguageModalOpen.value = false;
  }, 160);
};

// Feedback toast
const showToast = ref(false);
const toastMessage = ref('');

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
};

// Item click handler
const handleItemClick = (type: string) => {
  switch (type) {
    case 'profile':
      navigateTo('/profile/profileDetail');
      break;
    case 'language':
      isLanguageModalOpen.value = true;
      break;
    case 'faq':
      navigateTo('/faq');
      break;
    case 'contact':
      isContactModalOpen.value = true;
      break;
    case 'privacy':
    case 'terms':
      navigateTo('/terms');
      break;
  }
};
</script>

<template>
  <ion-page>
    <ion-content class="profile-page-content" :fullscreen="true">
      <div class="profile-container">
        <!-- 1. Centered Avatar & User Name -->
        <div class="avatar-section">
          <ion-avatar class="main-avatar">
            <img :src="user.avatar" :alt="user.fullName" />
          </ion-avatar>
          <h1 class="user-display-name">{{ user.fullName }}</h1>
        </div>

        <!-- 2. Profile Item -->
        <div class="menu-card single-item-card">
          <ion-item lines="none" button :detail="false" class="menu-item" @click="handleItemClick('profile')">
            <div slot="start" class="menu-icon-box">
              <Icon name="profile" size="22px" color="#475569" />
            </div>
            <ion-label class="menu-label">Profile</ion-label>
            <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
          </ion-item>
        </div>

        <!-- 3. Setting Section -->
        <div class="section-group">
          <div class="section-header-title">Setting</div>
          <div class="menu-card single-item-card">
            <ion-item lines="none" button :detail="false" class="menu-item" @click="handleItemClick('language')">
              <div slot="start" class="menu-icon-box">
                <Icon name="translate" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">Language</ion-label>
              <div slot="end" class="menu-end-slot">
                <div class="active-flag-wrapper">
                  <Icon :name="'flag-' + currentLanguage.code" size="18px" class="flag-svg" />
                </div>
                <span class="language-name">{{ currentLanguage.label }}</span>
                <ion-icon :icon="chevronForward" class="menu-chevron"></ion-icon>
              </div>
            </ion-item>
          </div>
        </div>

        <!-- 4. Help and Policies Section -->
        <div class="section-group">
          <div class="section-header-title">Help and Policies</div>
          <div class="menu-card grouped-card">
            <!-- FQA -->
            <ion-item lines="none" button :detail="false" class="menu-item bordered-bottom" @click="handleItemClick('faq')">
              <div slot="start" class="menu-icon-box">
                <Icon name="faq" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">FQA</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>

            <!-- Contact Us -->
            <ion-item lines="none" button :detail="false" class="menu-item bordered-bottom" @click="handleItemClick('contact')">
              <div slot="start" class="menu-icon-box">
                <Icon name="headset" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">Contact Us</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>

            <!-- Privacy Policy -->
            <ion-item lines="none" button :detail="false" class="menu-item bordered-bottom" @click="handleItemClick('privacy')">
              <div slot="start" class="menu-icon-box">
                <Icon name="shield" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">Privacy Policy</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>

            <!-- Terms Condition -->
            <ion-item lines="none" button :detail="false" class="menu-item" @click="handleItemClick('terms')">
              <div slot="start" class="menu-icon-box">
                <Icon name="document" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">Terms Condition</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>
          </div>
        </div>

        <!-- 5. App Version Footer -->
        <div class="app-version-text">App Version 1.0.0</div>
      </div>
    </ion-content>

    <!-- Custom Choose Language Bottom Sheet Modal -->
    <ion-modal
      :is-open="isLanguageModalOpen"
      :initial-breakpoint="0.36"
      :breakpoints="[0, 0.36]"
      :handle="false"
      class="language-modal-sheet"
      @didDismiss="isLanguageModalOpen = false"
    >
      <ion-content class="language-modal-content" :scroll-y="false">
        <div class="language-sheet-container">
          <div class="language-sheet-title">Choose Language</div>

          <div class="language-options-list">
            <div
              v-for="lang in languages"
              :key="lang.code"
              class="language-option-row"
              @click="selectLanguage(lang)"
            >
              <div class="lang-left">
                <!-- Flag Circles using Icon component -->
                <div class="flag-circle">
                  <Icon :name="'flag-' + lang.code" size="24px" class="sheet-flag-svg" />
                </div>

                <!-- Language Name Label -->
                <span class="lang-text">{{ lang.label }}</span>
              </div>

              <!-- Radio Button -->
              <div class="lang-radio-box">
                <div v-if="selectedLanguageCode === lang.code" class="radio-ring-active">
                  <div class="radio-dot-inner"></div>
                </div>
                <div v-else class="radio-ring-inactive"></div>
              </div>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Contact Us Bottom Sheet Modal -->
    <ContactModal
      :is-open="isContactModalOpen"
      @close="isContactModalOpen = false"
      @didDismiss="isContactModalOpen = false"
    />

    <!-- Toast Notification -->
    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :duration="2000"
      position="bottom"
      color="dark"
      @didDismiss="showToast = false"
    ></ion-toast>
  </ion-page>
</template>

<style scoped>
.profile-page-content {
  --background: #ffffff;
}

.profile-container {
  padding: 24px 18px 40px 18px;
  width: 100%;
  box-sizing: border-box;
}

/* 1. Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 28px;
}

.main-avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.main-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-display-name {
  font-size: 19px;
  font-weight: 800;
  color: #1e293b;
  margin-top: 14px;
  margin-bottom: 0;
  letter-spacing: -0.3px;
  text-align: center;
}

/* 2. Menu Cards & Groups */
.section-group {
  margin-top: 20px;
}

.section-header-title {
  font-size: 13.5px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 8px;
  padding-left: 2px;
}

.menu-card {
  background: #ffffff;
}

.single-item-card {
  margin-bottom: 4px;
}

.grouped-card {
  border-radius: 0;
}

.menu-item {
  --background: transparent;
  background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --min-height: 52px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.menu-item:active {
  opacity: 0.75;
}

.bordered-bottom {
  border-bottom: 1px solid #f1f5f9;
}

.menu-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.menu-label {
  font-size: 15.5px;
  color: #1e293b;
  font-weight: 500;
  margin: 0;
}

.menu-end-slot {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flag-svg {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: block;
}

.language-name {
  font-size: 14.5px;
  color: #94a3b8;
  font-weight: 400;
  margin-left: 2px;
}

.menu-chevron {
  font-size: 19px;
  color: #64748b;
  margin-left: 4px;
}

/* 5. App Version Footer */
.app-version-text {
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 400;
  margin-top: 32px;
  letter-spacing: 0.2px;
}

.active-flag-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
}

/* Choose Language Modal Sheet Styling */
.language-modal-content {
  --background: #ffffff;
  background: #ffffff;
}

.language-sheet-container {
  background-color: #ffffff;
  padding: 22px 24px 34px 24px;
  box-sizing: border-box;
}

.language-sheet-title {
  text-align: center;
  font-size: 18.5px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 2px;
  margin-bottom: 22px;
  letter-spacing: -0.2px;
}

.language-options-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.language-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s ease;
}

.language-option-row:active {
  opacity: 0.7;
}

.lang-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.flag-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.sheet-flag-svg {
  width: 24px;
  height: 24px;
  display: block;
}

.lang-text {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  letter-spacing: -0.2px;
}

.lang-radio-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.radio-ring-active {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #de5d0a;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  box-sizing: border-box;
}

.radio-dot-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #de5d0a;
}

.radio-ring-inactive {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.8px solid #1e293b;
  background: transparent;
  box-sizing: border-box;
}
</style>

<style>
/* Global modal container overrides for the white language sheet */
ion-modal.language-modal-sheet {
  --background: #ffffff;
  --border-radius: 24px 24px 0 0;
  --backdrop-opacity: 0.55;
}

ion-modal.language-modal-sheet::part(content) {
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
}
</style>
