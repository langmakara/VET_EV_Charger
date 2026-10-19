<script setup lang="ts">
import { computed } from 'vue';
import { IonModal, IonButton } from '@ionic/vue';


const props = defineProps<{
  isOpen: boolean;
  type?: 'logout' | 'delete' | 'exit' | 'save' | 'activate' | 'inactivate' | 'terminate' | 'stop' | 'voucher' | 'success' | 'custom';
  name?: string;
  title?: string;
  message?: string;
  labelCancel?: string;
  labelConfirm?: string;
  isLoading?: boolean;
  hideCancel?: boolean;
  hideConfirm?: boolean;
  outlineConfirm?: boolean;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm'): void;
  (e: 'didDismiss'): void;
}>();

const { t } = useI18n();


const config = computed(() => {
  const base = {
    color: '#E53935',
    title: props.title || t('label.message'),
    message: props.message || '',
    btnCancel: props.labelCancel || t('label.cancel'),
    btnConfirm: props.labelConfirm || t('label.confirm')
  };

  switch (props.type) {
    case 'logout':
      base.title = props.title || t('label.logout');
      base.message = props.message || t('label.logout_message');
      base.color = '#E53935';
      break;
    case 'delete':
      base.title = props.title || t('label.delete');
      base.message = props.message || (props.name ? t('label.delete_message_with_name', { name: props.name }) : t('label.delete_message'));
      base.color = '#E53935';
      break;
    case 'exit':
      base.title = props.title || t('label.exit');
      base.message = props.message || t('label.exit_message');
      base.color = '#E53935';
      break;
    case 'save':
      base.title = props.title || t('label.save');
      base.message = props.message || t('label.save_message');
      base.color = '#00A651'; // brand/green
      break;
    case 'activate':
      base.title = props.title || t('label.activate');
      base.message = props.message || t('label.activate_message');
      base.color = '#00A651';
      break;
    case 'inactivate':
      base.title = props.title || t('label.inactivate');
      base.message = props.message || t('label.inactivate_message');
      base.color = '#E53935';
      break;
    case 'terminate':
      base.title = props.title || t('label.terminate');
      base.message = props.message || t('label.terminate_message');
      base.color = '#E53935';
      break;
    case 'stop':
      base.title = props.title || t('label.message');
      base.message = props.message || t('label.stop_message');
      base.color = '#E53935';
      break;
    case 'voucher':
      base.title = props.title || t('label.add_voucher');
      base.message = props.message || t('label.add_voucher_message');
      base.btnConfirm = props.labelConfirm || t('label.add_voucher_confirm');
      base.btnCancel = props.labelCancel || t('label.cancel');
      base.color = '#e66a15';
      break;
    case 'success':
      base.title = props.title || 'Scanned Successfully!';
      base.message = props.message || 'Your QR Code scanned Successfully!';
      base.btnConfirm = props.labelConfirm || t('common.ok') || 'OK';
      base.color = '#00A651';
      break;
  }
  
  return base;
});
</script>

<template>
  <ion-modal :is-open="isOpen" class="custom-alert-modal" @didDismiss="emit('didDismiss')">
    <div class="modal-content-wrapper">
      <div class="modal-body">
        <div class="icon-container">
          <slot name="icon">
            <svg v-if="props.type === 'voucher'" width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="36" cy="36" r="36" fill="#e66a15"/>
              <g transform="translate(36, 36) rotate(-35) translate(-21, -13)">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 0C1.34315 0 0 1.34315 0 3V9.5C1.933 9.5 3.5 11.067 3.5 13C3.5 14.933 1.933 16.5 0 16.5V23C0 24.6569 1.34315 26 3 26H39C40.6569 26 42 24.6569 42 23V16.5C40.067 16.5 38.5 14.933 38.5 13C38.5 11.067 40.067 9.5 42 9.5V3C42 1.34315 40.6569 0 39 0H3Z" fill="white"/>
                <line x1="21" y1="2.5" x2="21" y2="23.5" stroke="#e66a15" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.5 3"/>
              </g>
            </svg>
            <svg v-else-if="props.type === 'success'" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="34" cy="34" r="34" fill="#00A651"/>
              <path d="M20 34.5L29 43.5L47 25.5" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <Icon v-else name="info" size="64px" :color="config.color" />
          </slot>
        </div>
        
        <h2 class="modal-title">{{ config.title }}</h2>
        <p class="modal-desc" v-html="config.message"></p>
        <div v-if="props.type === 'stop'" class="stopType">
          <ion-grid>
            <ion-row>
              <ion-col size="auto">
                <Icon name="info-circle" size="32px" color="#FF9800" />
              </ion-col>
              <ion-col class="warting-col">
                <h2 class="warting-title">{{ $t('label.return_moneyT') }}</h2>
              </ion-col>
            </ion-row>
          </ion-grid>
          <p class="stopType-desc">{{ $t('label.return_money1') }}</p>
          <p class="stopType-desc">{{ $t('label.return_money2') }}</p>
        </div>
        <div v-if="!hideCancel || !hideConfirm" class="modal-actions">
          <ion-button v-if="!hideCancel" fill="outline" class="cancel-btn" :disabled="isLoading" @click="emit('cancel')">
            {{ config.btnCancel }}
          </ion-button>
          <ion-button 
            v-if="!hideConfirm"
            :fill="outlineConfirm ? 'outline' : 'solid'"
            :class="outlineConfirm ? 'cancel-btn' : 'confirm-btn'"
            :disabled="isLoading"
            :style="!outlineConfirm ? { '--background': config.color, '--background-activated': config.color } : {}"
            @click="emit('confirm')"
          >
            {{ config.btnConfirm }}
          </ion-button>
        </div>
      </div>
    </div>
  </ion-modal>
</template>

<style scoped>
.custom-alert-modal {
  --width: 90%;
  --max-width: 340px;
  --height: auto;
  --border-radius: 16px;
  --background: transparent;
  --box-shadow: none;
}

.custom-alert-modal::part(content) {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content-wrapper {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body {
  padding: 32px 24px 24px;
  text-align: center;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 12px 0;
}

.modal-desc {
  font-size: 15px;
  color: #8C99A8;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  margin: 0;
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  text-transform: none;
}

.cancel-btn {
  --border-color: #E2E8F0;
  --border-width: 1px;
  --color: #475569;
}

.confirm-btn {
  --color: white;
  --box-shadow: none;
}

.stopType {
  background-color: #FFF6E8;
  padding: var(--ion-padding);
  margin-bottom: var(--ion-padding);
  border-radius: var(--ion-padding);
}

.warting-title {
  text-align: start;
  justify-content: center;
  margin: 0;
  margin-left: 10px;
}

.warting-col{
  display: flex;
  align-items: center;
  text-align: start;
}

.stopType-desc {
  text-align: start;
}
ion-grid {
  padding: 0;
}
ion-col {
  padding: 0;
}
</style>
