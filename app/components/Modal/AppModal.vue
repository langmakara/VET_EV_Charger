<script setup lang="ts">
import { computed } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter
} from '@ionic/vue'
import Icon from '~/components/Icon/icon.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'full'
    /** Bottom-sheet mode, e.g. [0, 0.5, 1] */
    breakpoints?: number[]
    initialBreakpoint?: number
    backdropDismiss?: boolean
    showHeader?: boolean
    showClose?: boolean
    handle?: boolean
  }>(),
  {
    title: '',
    size: 'md',
    breakpoints: undefined,
    initialBreakpoint: undefined,
    backdropDismiss: true,
    showHeader: true,
    showClose: true,
    handle: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'didPresent'): void
  (e: 'didDismiss'): void
}>()

const isSheet = computed(() => !!props.breakpoints?.length)

function close_() {
  emit('update:modelValue', false)
}

function onDidDismiss() {
  // Fires on backdrop tap / swipe / ESC, keeps v-model in sync
  emit('update:modelValue', false)
  emit('didDismiss')
}
</script>

<template>
  <IonModal
    mode="ios"
    :is-open="modelValue"
    :class="['app-modal', `app-modal--${size}`, { 'app-modal--sheet': isSheet }]"
    :breakpoints="breakpoints"
    :initial-breakpoint="initialBreakpoint"
    :backdrop-dismiss="backdropDismiss"
    :handle="handle"
    @didPresent="emit('didPresent')"
    @didDismiss="onDidDismiss"
  >
    <IonHeader v-if="showHeader" class="ion-no-border app-modal__header">
      <IonToolbar class="app-modal__toolbar">
        <IonTitle class="app-modal__title">{{ title }}</IonTitle>
        <IonButtons slot="end">
          <slot name="header-end" />
          <IonButton v-if="showClose" class="app-modal__close-btn" aria-label="Close" @click="close_">
            <Icon name="close" size="22px" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent class="app-modal__content">
      <slot :close="close_" />
    </IonContent>

    <IonFooter v-if="$slots.footer" class="ion-no-border">
      <IonToolbar>
        <div class="app-modal__footer">
          <slot name="footer" :close="close_" />
        </div>
      </IonToolbar>
    </IonFooter>
  </IonModal>
</template>

<style>
/* Not scoped: ion-modal renders its content in a shadow part */
ion-modal.app-modal {
  --background: #ffffff;
  --border-radius: 24px 24px 0 0;
}

ion-modal.app-modal::part(content) {
  border-radius: var(--ion-padding);
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
}

ion-modal.app-modal--sm { --width: 360px;  --height: auto; --max-height: 90%; }
ion-modal.app-modal--md { --width: 520px;  --height: auto; --max-height: 90%; }
ion-modal.app-modal--lg { --width: 800px;  --height: 80%;  }
ion-modal.app-modal--full { --width: 100%; --height: 100%; --border-radius: 0; }

/* Auto height needs the content to size itself */
ion-modal.app-modal--sm ion-content,
ion-modal.app-modal--md ion-content { --overflow: auto; position: relative; contain: content; }

/* Sheet mode ignores width/height presets */
ion-modal.app-modal--sheet { --width: 100%; --height: 100%; }

ion-modal.app-modal .app-modal__toolbar {
  --background: #ffffff;
  --border-width: 0;
  --min-height: 56px;
  padding: 8px 12px 0 12px;
}

ion-modal.app-modal .app-modal__title {
  font-size: var(--app-font-size-title);
  font-weight: 700;
  color: #111827;
  text-align: center;
  padding: 0 36px;
}

ion-modal.app-modal .app-modal__close-btn {
  --color: #111827;
  font-size: 24px;
  font-weight: 700;
  margin-right: 4px;
}

ion-modal.app-modal .app-modal__content {
  --background: #ffffff;
  --padding-top: 8px;
  --padding-bottom: 24px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.app-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
}

/* Phones: sm/md/lg become full width */
@media (max-width: 575px) {
  ion-modal.app-modal--sm,
  ion-modal.app-modal--md,
  ion-modal.app-modal--lg { --width: 100%; }
}
</style>
