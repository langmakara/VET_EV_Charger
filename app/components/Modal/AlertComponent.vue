<script setup lang="ts">
import { computed } from 'vue';
import { IonModal, IonButton } from '@ionic/vue';


const props = defineProps<{
  isOpen: boolean;
  type?: 'logout' | 'delete' | 'exit' | 'save' | 'activate' | 'inactivate' | 'terminate' | 'stop' | 'custom';
  name?: string;
  title?: string;
  message?: string;
  labelCancel?: string;
  labelConfirm?: string;
  isLoading?: boolean;
  hideCancel?: boolean;
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
            <Icon name="info" size="64px" :color="config.color" />
          </slot>
        </div>
        
        <h2 class="modal-title">{{ config.title }}</h2>
        <p class="modal-desc" v-html="config.message"></p>
        
        <div class="modal-actions">
          <ion-button v-if="!hideCancel" fill="outline" class="cancel-btn" :disabled="isLoading" @click="emit('cancel')">
            {{ config.btnCancel }}
          </ion-button>
          <ion-button 
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
  margin: 0 0 24px 0;
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
</style>
