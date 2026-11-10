<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    IonPage,
    IonContent,
    IonAvatar,
    IonItem,
    IonLabel,
    IonIcon,
    IonModal
  } from '@ionic/vue'
  import ToastAlert from '~/components/Alert/ToastAlert.vue'
  import { chevronForward } from 'ionicons/icons'
  import Icon from '~/components/Icon/icon.vue'
  import ContactModal from './contactModal.vue'
  import LanguageModal from './languageModal.vue'
  import type { SupportedLocale } from '~/helpers/languages'
  import { useABAMiniApp } from '@/composables/useNativeBridge'
  
  const { userProfile } = useABAMiniApp()
  const defaultAvatar = '/vet-ev-charger/images/EVLogo.svg'

  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    if (target && !target.src.includes('EVLogo.svg')) {
      target.src = defaultAvatar
    }
  }
  

  const { locale, setLocale, t } = useI18n()

  // User information from centralized data
  // Profile user data from useUserProfile with fallback to centralized JSON

  // Language definitions
  interface LanguageOption {
    code: SupportedLocale
    label: string
    toastText: string
  }

  const defaultLanguage: LanguageOption = {
    code: 'en',
    label: 'English',
    toastText: 'Language changed to English'
  }

  const languages: LanguageOption[] = [
    { code: 'km', label: 'ភាសាខ្មែរ', toastText: 'បានប្តូរទៅភាសាខ្មែរ' },
    defaultLanguage,
    { code: 'zh', label: '中文', toastText: '语言已切换为中文' }
  ]

  const selectedLanguageCode = computed(() => (locale.value as SupportedLocale) || 'en')
  const isLanguageModalOpen = ref(false)
  const isContactModalOpen = ref(false)

  const currentLanguage = computed<LanguageOption>(() => {
    return languages.find((l) => l.code === selectedLanguageCode.value) ?? defaultLanguage
  })

  // Feedback toast
  const showToast = ref(false)
  const toastMessage = ref('')

  const triggerToast = (msg: string) => {
    toastMessage.value = msg
    showToast.value = true
  }

  // Item click handler
  const handleItemClick = (type: string) => {
    switch (type) {
      case 'profile':
        navigateTo('/profile/profileDetail')
        break
      case 'language':
        isLanguageModalOpen.value = true
        break
      case 'faq':
        navigateTo('/faq')
        break
      case 'contact':
        isContactModalOpen.value = true
        break
      case 'privacy':
      case 'terms':
        navigateTo('/terms')
        break
    }
  }
</script>

<template>
  <ion-page>
    <ion-content class="profile-page-content" :fullscreen="true">
      <div class="profile-container">
        <!-- 1. Centered Avatar & User Name -->
        <div class="avatar-section">
          <ion-avatar class="main-avatar">
            <img
              :src="userProfile?.avatar || userProfile?.photo || defaultAvatar"
              :alt="userProfile?.fullName || 'User Avatar'"
              @error="handleImageError"
            />
          </ion-avatar>
          <h1 class="user-display-name">{{ userProfile?.fullName }}</h1>
        </div>

        <!-- 2. Profile Item -->
        <div class="menu-card single-item-card">
          <ion-item
            lines="none"
            button
            :detail="false"
            class="menu-item"
            @click="handleItemClick('profile')"
          >
            <div slot="start" class="menu-icon-box">
              <Icon name="profile" size="22px" color="#475569" />
            </div>
            <ion-label class="menu-label">{{ $t('profile.title') }}</ion-label>
            <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
          </ion-item>
        </div>

        <!-- 3. Setting Section -->
        <div class="section-group">
          <div class="section-header-title">{{ $t('profile.setting') }}</div>
          <div class="menu-card single-item-card">
            <ion-item
              lines="none"
              button
              :detail="false"
              class="menu-item"
              @click="handleItemClick('language')"
            >
              <div slot="start" class="menu-icon-box">
                <Icon name="translate" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">{{ $t('profile.language') }}</ion-label>
              <div slot="end" class="menu-end-slot">
                <div class="active-flag-wrapper">
                  <Icon
                    :name="'flag-' + (currentLanguage?.code || 'en')"
                    size="18px"
                    class="flag-svg"
                  />
                </div>
                <span class="language-name">{{ currentLanguage?.label || 'English' }}</span>
                <ion-icon :icon="chevronForward" class="menu-chevron"></ion-icon>
              </div>
            </ion-item>
          </div>
        </div>

        <!-- 4. Help and Policies Section -->
        <div class="section-group">
          <div class="section-header-title">{{ $t('profile.helpAndPolicies') }}</div>
          <div class="menu-card grouped-card">
            <!-- FQA -->
            <ion-item
              lines="none"
              button
              :detail="false"
              class="menu-item bordered-bottom"
              @click="handleItemClick('faq')"
            >
              <div slot="start" class="menu-icon-box">
                <Icon name="faq" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">{{ $t('profile.faq') }}</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>

            <!-- Contact Us -->
            <ion-item
              lines="none"
              button
              :detail="false"
              class="menu-item bordered-bottom"
              @click="handleItemClick('contact')"
            >
              <div slot="start" class="menu-icon-box">
                <Icon name="headset" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">{{ $t('profile.contactUs') }}</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>

            <!-- Privacy Policy -->
            <ion-item
              lines="none"
              button
              :detail="false"
              class="menu-item bordered-bottom"
              @click="handleItemClick('privacy')"
            >
              <div slot="start" class="menu-icon-box">
                <Icon name="shield" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">{{ $t('profile.privacyPolicy') }}</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>

            <!-- Terms Condition -->
            <ion-item
              lines="none"
              button
              :detail="false"
              class="menu-item"
              @click="handleItemClick('terms')"
            >
              <div slot="start" class="menu-icon-box">
                <Icon name="document" size="22px" color="#475569" />
              </div>
              <ion-label class="menu-label">{{ $t('profile.termsCondition') }}</ion-label>
              <ion-icon slot="end" :icon="chevronForward" class="menu-chevron"></ion-icon>
            </ion-item>
          </div>
        </div>

        <!-- 5. App Version Footer -->
        <div class="app-version-text">{{ $t('profile.appVersion') }}</div>
      </div>
    </ion-content>

    <!-- Custom Choose Language Bottom Sheet Modal -->
    <LanguageModal
      :is-open="isLanguageModalOpen"
      @close="isLanguageModalOpen = false"
      @didDismiss="isLanguageModalOpen = false"
      @toast="triggerToast"
    />

    <!-- Contact Us Bottom Sheet Modal -->
    <ContactModal
      :is-open="isContactModalOpen"
      @close="isContactModalOpen = false"
      @didDismiss="isContactModalOpen = false"
    />

    <!-- Toast Notification -->
    <ToastAlert
      v-model:isOpen="showToast"
      :message="toastMessage"
      type="success"
      position="bottom"
    />
  </ion-page>
</template>

<style scoped>
  .profile-page-content {
    --background: #ffffff;
  }

  .profile-container {
    padding-top: var(--ion-padding);
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
</style>
