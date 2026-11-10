<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IonModal, IonContent } from '@ionic/vue';
import Icon from '~/components/Icon/icon.vue';
import { getLangIdFromLocale, type SupportedLocale } from '~/helpers/languages';

export interface LanguageOption {
  code: SupportedLocale;
  label: string;
  toastText: string;
}

const defaultLanguage: LanguageOption = {
  code: 'en',
  label: 'English',
  toastText: 'Language changed to English'
};

const languages: LanguageOption[] = [
  { code: 'km', label: 'ភាសាខ្មែរ', toastText: 'បានប្តូរទៅភាសាខ្មែរ' },
  defaultLanguage,
  { code: 'zh', label: '中文', toastText: '语言已切换为中文' }
];

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
  }>(),
  {
    isOpen: false
  }
);

const emit = defineEmits<{
  (e: 'didDismiss'): void;
  (e: 'close'): void;
  (e: 'update:isOpen', value: boolean): void;
  (e: 'toast', message: string): void;
}>();

const { locale, setLocale, t } = useI18n();
const langIdCookie = useCookie<string | number | null>('lang_id');
const nuxtApp = useNuxtApp();

const selectedLanguageCode = computed(() => (locale.value as SupportedLocale) || 'en');

const handleDismiss = () => {
  emit('didDismiss');
  emit('update:isOpen', false);
  emit('close');
};

const selectLanguage = async (lang: LanguageOption) => {
  try {
    const targetCode = lang.code;
    const numericLangId = getLangIdFromLocale(targetCode);
    langIdCookie.value = numericLangId;

    const i18n = (nuxtApp as any)?.$i18n;
    if (typeof setLocale === 'function') {
      await setLocale(targetCode);
    } else if (i18n?.setLocale) {
      await i18n.setLocale(targetCode);
    } else {
      locale.value = targetCode;
    }

    emit('toast', lang.toastText);
  } catch (err) {
    console.error('Failed to change language:', err);
  } finally {
    setTimeout(() => {
      handleDismiss();
    }, 160);
  }
};
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="0.36"
    :breakpoints="[0, 0.36]"
    :handle="false"
    class="language-modal-sheet"
    @didDismiss="handleDismiss"
  >
    <ion-content class="language-modal-content" :scroll-y="false">
      <div class="language-sheet-container">
        <div class="language-sheet-title">{{ $t('profile.chooseLanguage') }}</div>

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
</template>

<style scoped>
.language-modal-content {
  --background: #ffffff;
  background: #ffffff;
}

.language-sheet-container {
  background-color: #ffffff;
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

