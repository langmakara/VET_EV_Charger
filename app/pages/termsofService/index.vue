<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonToast } from '@ionic/vue';
import AppButton from '~/components/Button/AppButton.vue';
import { useABAMiniApp } from '~/composables/useNativeBridge';
import { useSendProfile, getIsNewAbaUser } from '~/composables/useSendProfile';
import LoadingPage from '~/components/loading/loadingPage.vue';

interface Props {
  showLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showLoading: true,
});

const { t } = useI18n();
const router = useRouter();
const { closeMiniApp } = useABAMiniApp();
const { authResponse, authToken, authCustomer, isNewAbaUser } = useSendProfile();

// Startup loading state (waits until token is retrieved from API)
const showStartupLoading = ref(props.showLoading);
// Terms of service content is shown only when not loading AND newAbaUser: true
const showTermsContent = ref(!props.showLoading);
const isDataLoaded = ref(false);

watch(
  [() => authToken.value, () => authResponse.value],
  ([token, auth]) => {
    const resAny = auth as any;
    const body = resAny?.body;
    if (token || body?.accessToken || body?.token || resAny?.data?.accessToken || resAny?.data?.token) {
      isDataLoaded.value = true;
    }
  },
  { immediate: true }
);

/**
 * Handle loading completion from LoadingPage.
 * If newAbaUser is true: reveal the Terms of Service onboarding page.
 * If newAbaUser is false: directly navigate to the EV Charger home page.
 */
const handleLoadingComplete = async (payload?: { newAbaUser?: boolean }) => {
  const isNew = typeof payload?.newAbaUser === 'boolean' ? payload.newAbaUser : getIsNewAbaUser();

  if (isNew) {
    showStartupLoading.value = false;
    showTermsContent.value = true;
  } else {
    showTermsContent.value = false;
    await navigateTo('/ev_charger', { replace: true });
    showStartupLoading.value = false;
  }
};

const showToast = ref(false);
const toastMessage = ref('');

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
};

const handleAccept = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vet_ev_terms_accepted', 'true');
  }
  triggerToast(t('termsOfService.termsAccepted'));
  setTimeout(() => {
    navigateTo('/ev_charger', { replace: true });
  }, 400);
};

const handleCancel = () => {
  if (typeof window !== 'undefined' && window.history.length > 1 && window.history.state?.back) {
    router.back();
  } else {
    closeMiniApp();
  }
};

const openAbaTerms = () => {
  navigateTo('/terms');
};

const openVetTerms = () => {
  navigateTo('/terms');
};
</script>

<template>
  <ion-page>
    <!-- Main Terms Content: only shown when loading finishes and newAbaUser: true -->
    <ion-content v-if="showTermsContent" class="terms-page-content" :fullscreen="true">
      <div class="terms-container">
        <!-- 1. Header with title & divider -->
        <div class="terms-header">
          <h1 class="terms-title">{{ $t('termsOfService.title') }}</h1>
          <div class="terms-divider"></div>
        </div>

        <!-- 2. Main Body Content -->
        <div class="terms-body">
          <!-- Logo Emblem inside orange circle -->
          <div class="logo-circle-container">
            <div class="vet-circle-logo">
              <img src="/images/logo.svg" alt="VET EV Charger" class="vet-logo-img" />
            </div>
          </div>

          <!-- App Title -->
          <h2 class="app-name-title">{{ $t('termsOfService.appName') }}</h2>

          <!-- Subtitle / Tagline -->
          <p class="app-tagline">
            {{ $t('termsOfService.tagline') }}
          </p>

          <!-- Disclaimer Paragraph 1 -->
          <p class="terms-paragraph">
            {{ $t('termsOfService.disclaimer1') }}
          </p>

          <!-- Disclaimer Paragraph 2 -->
          <p class="terms-paragraph">
            {{ $t('termsOfService.agreePrefix') }}
            <a href="#" class="terms-link" @click.prevent="openAbaTerms">{{ $t('termsOfService.abaTerms') }}</a>,
            {{ $t('termsOfService.and') }}
            <a href="#" class="terms-link" @click.prevent="openVetTerms">{{ $t('termsOfService.vetTerms') }}</a>,
            {{ $t('termsOfService.agreeSuffix') }}
          </p>

          <!-- Action Buttons using AppButton component -->
          <div class="terms-actions">
            <AppButton
              class="terms-btn-accept"
              expand="block"
              :label="$t('termsOfService.accept')"
              @click="handleAccept"
            />
            <AppButton
              class="terms-btn-cancel"
              expand="block"
              fill="outline"
              :label="$t('termsOfService.cancel')"
              @click="handleCancel"
            />
          </div>
        </div>
      </div>
    </ion-content>

    <!-- App Startup Loading Screen (transitions to Terms of Service on API token success only when newAbaUser: true) -->
    <LoadingPage
      v-if="showStartupLoading"
      :is-loaded="isDataLoaded"
      @complete="handleLoadingComplete"
    />
  </ion-page>
</template>

<style scoped>
.terms-page-content {
  --background: #ffffff;
  background: #ffffff;
}

.terms-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #ffffff;
  box-sizing: border-box;
}

/* 1. Header */
.terms-header {
  padding: 24px 20px 0 20px;
}

.terms-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.2px;
}

.terms-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin-top: 14px;
  width: 100%;
}

/* 2. Body */
.terms-body {
  padding: 36px 20px 32px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.logo-circle-container {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.vet-circle-logo {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background-color: #d65509;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(214, 85, 9, 0.22);
  overflow: hidden;
}

.vet-logo-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  display: block;
}

.app-name-title {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin: 0 0 12px 0;
  letter-spacing: -0.3px;
}

.app-tagline {
  font-size: 13.5px;
  font-weight: 400;
  color: #64748b;
  text-align: center;
  line-height: 1.5;
  max-width: 330px;
  margin: 0 auto 36px auto;
}

.terms-paragraph {
  font-size: 13.5px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 20px 0;
  text-align: left;
}

.terms-link {
  color: #0284c7;
  text-decoration: underline;
  font-weight: 400;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.terms-link:active {
  opacity: 0.7;
}

/* 3. Actions */
.terms-actions {
  margin-top: auto;
  padding-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.terms-btn-accept {
  --background: #ef4d4d;
  --background-hover: #dc3838;
  --background-activated: #dc3838;
  --color: #ffffff;
  --border-radius: 8px;
  --height: 48px;
  min-height: 48px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.6px;
  margin: 0;
}

.terms-btn-accept::part(native) {
  background: #ef4d4d;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.6px;
  box-shadow: none;
}

.terms-btn-cancel {
  --background: #ffffff;
  --color: #ef4d4d;
  --border-color: #ef4d4d;
  --border-width: 1.5px;
  --border-style: solid;
  --border-radius: 8px;
  --height: 48px;
  min-height: 48px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.6px;
  margin: 0;
}

.terms-btn-cancel::part(native) {
  background: #ffffff;
  color: #ef4d4d;
  border: 1.5px solid #ef4d4d;
  border-radius: 8px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.6px;
  box-shadow: none;
}
</style>