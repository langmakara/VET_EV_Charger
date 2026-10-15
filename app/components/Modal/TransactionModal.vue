<script setup lang="ts">
import { 
  IonModal,
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonButton,
  IonList
} from '@ionic/vue';

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
    title?: string;
    initialBreakpoint?: number;
    breakpoints?: number[];
  }>(),
  {
    isOpen: false,
    title: 'Transaction Detail',
    initialBreakpoint: 0.60,
    breakpoints: () => [0, 0.60, 0.9, 1]
  }
);

const emit = defineEmits<{
  (e: 'did-dismiss'): void;
  (e: 'close'): void;
  (e: 'update:isOpen', value: boolean): void;
}>();

const dismiss = () => {
  emit('did-dismiss');
  emit('close');
  emit('update:isOpen', false);
};
</script>

<template>
  <ion-modal 
    :is-open="isOpen" 
    @didDismiss="dismiss"
    :initial-breakpoint="initialBreakpoint" 
    :breakpoints="breakpoints"
  >
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">
          <slot name="title">{{ title }}</slot>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="dismiss" class="close-btn">
            <Icon name="mdi:close" size="24px" class="close-icon" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding custom-content">
      <div class="detail-container">
        <ion-list lines="full" class="custom-list">
          <slot />
        </ion-list>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.custom-toolbar {
  --background: #ffffff;
  --min-height: 56px;
  padding-top: 8px;
}

.custom-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f232d;
  text-align: center;
}

.close-btn {
  --color: #1f232d;
}

.close-icon {
  color: #1f232d;
}

.custom-content {
  --background: #ffffff;
}

.detail-container {
  padding: 0 8px;
}

.custom-list {
  background: transparent;
}

:deep(ion-item) {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --border-color: #f3f4f6;
  --min-height: 56px;
  font-size: 14px;
}

:deep(ion-label) {
  font-weight: 400;
}

:deep(ion-note) {
  font-size: 14px;
  font-weight: 400;
}

:deep(.bold-value) {
  font-weight: 600 !important;
  color: #1f232d !important;
}

:deep(.points-earned) {
  color: #22a15b !important;
  font-weight: 500 !important;
}

:deep(.points-spend) {
  color: #e84040 !important;
  font-weight: 500 !important;
}
</style>
