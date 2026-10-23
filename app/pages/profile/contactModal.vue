<script setup lang="ts">
import { IonModal, IonContent, IonIcon } from '@ionic/vue';
import { chevronForward } from 'ionicons/icons';
import Icon from '~/components/Icon/icon.vue';

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
    phoneNumber?: string;
    facebookUrl?: string;
  }>(),
  {
    isOpen: false,
    phoneNumber: '087 220 327',
    facebookUrl: 'https://www.facebook.com/...'
  }
);

const emit = defineEmits<{
  (e: 'didDismiss'): void;
  (e: 'close'): void;
  (e: 'update:isOpen', value: boolean): void;
}>();

const handleDismiss = () => {
  emit('didDismiss');
  emit('update:isOpen', false);
  emit('close');
};

const callSupport = () => {
  const sanitized = props.phoneNumber.replace(/\s+/g, '');
  if (typeof window !== 'undefined') {
    window.location.href = `tel:${sanitized}`;
  }
};

const openFacebook = () => {
  if (typeof window !== 'undefined') {
    window.open('https://www.facebook.com', '_blank');
  }
};
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="0.32"
    :breakpoints="[0, 0.32]"
    :handle="false"
    class="contact-sheet-modal"
    @didDismiss="handleDismiss"
  >
    <ion-content class="contact-modal-content" :scroll-y="false">
      <div class="contact-sheet-container">
        <!-- Header -->
        <div class="contact-sheet-header">
          <div class="header-spacer"></div>
          <div class="contact-sheet-title">Contact Us</div>
          <button class="contact-close-button" type="button" aria-label="Close" @click="handleDismiss">
            <Icon name="close" size="18px" color="#1E293B" />
          </button>
        </div>

        <!-- Contact Cards Group -->
        <div class="contact-cards-group">
          <!-- 1. Customer Support Phone -->
          <div class="contact-card" @click="callSupport">
            <div class="contact-card-icon-box">
              <Icon name="phone-call" size="26px" color="#00A859" />
            </div>
            <div class="contact-card-info">
              <div class="contact-card-title">VET EV Charger Customer Support</div>
              <div class="contact-card-sub">{{ phoneNumber }}</div>
            </div>
            <ion-icon :icon="chevronForward" class="contact-chevron"></ion-icon>
          </div>

          <!-- 2. Facebook Page -->
          <div class="contact-card" @click="openFacebook">
            <div class="contact-card-icon-box">
              <Icon name="facebook" size="28px" />
            </div>
            <div class="contact-card-info">
              <div class="contact-card-title">VET EV Charger Facebook Page</div>
              <div class="contact-card-sub">{{ facebookUrl }}</div>
            </div>
            <ion-icon :icon="chevronForward" class="contact-chevron"></ion-icon>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.contact-modal-content {
  --background: #ffffff;
  background: #ffffff;
}

.contact-sheet-container {
  background-color: #ffffff;
  padding: 16px 16px 28px 16px;
  box-sizing: border-box;
}

.contact-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  position: relative;
}

.header-spacer {
  width: 28px;
  height: 28px;
}

.contact-sheet-title {
  font-size: 17.5px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
  text-align: center;
}

.contact-close-button {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  transition: background-color 0.15s ease;
}

.contact-close-button:active {
  background-color: #f1f5f9;
}

.contact-cards-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.contact-card:active {
  transform: scale(0.99);
  background-color: #fcfcfc;
}

.contact-card-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.contact-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.contact-card-title {
  font-size: 14.5px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.2px;
  line-height: 1.25;
}

.contact-card-sub {
  font-size: 13px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-chevron {
  font-size: 18px;
  color: #64748b;
  margin-left: 10px;
  flex-shrink: 0;
}
</style>

<style>
/* Global modal container overrides for the contact sheet modal */
ion-modal.contact-sheet-modal {
  --background: #ffffff;
  --border-radius: 20px 20px 0 0;
  --backdrop-opacity: 0.55;
}

ion-modal.contact-sheet-modal::part(content) {
  border-radius: 20px 20px 0 0;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
}
</style>
