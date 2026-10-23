<script setup lang="ts">
  import { ref } from 'vue'
  import {
    IonModal,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText
  } from '@ionic/vue'
  import Icon from '~/components/Icon/icon.vue'
  import AppButton from '~/components/Button/AppButton.vue'

  const props = withDefaults(
    defineProps<{
      isOpen?: boolean
    }>(),
    {
      isOpen: false
    }
  )

  const emit = defineEmits<{
    (e: 'didDismiss'): void
    (e: 'close'): void
    (e: 'select', plug: { id: string; name: string; status: string }): void
  }>()

  const plugs = ref([
    { id: 'plugA', name: 'Plug A', status: 'Available' },
    { id: 'plugB', name: 'Plug B', status: 'Available' }
  ])

  const selectedPlug = ref('plugA')

  function handleSelect(plug: (typeof plugs.value)[0]) {
    selectedPlug.value = plug.id
    emit('select', plug)
  }
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    mode="ios"
    :handle="true"
    @didDismiss="emit('didDismiss')"
    :initial-breakpoint="0.50"
    :breakpoints="[0, 0.50]"
  >
    <ion-content class="ion-no-padding">
      <ion-card class="modal-card">
        <ion-card-header class="modal-header">
          <ion-card-title class="modal-title">Plug Selection</ion-card-title>
          <ion-text class="modal-subtitle">Select your preferred plug type</ion-text>
        </ion-card-header>

        <ion-card-content class="modal-body">
          <div class="plug-list">
            <div
              v-for="plug in plugs"
              :key="plug.id"
              class="plug-card"
              :class="{ 'is-selected': selectedPlug === plug.id }"
              @click="handleSelect(plug)"
            >
              <!-- Icon Badge Box -->
              <div class="plug-icon-box" :class="{ 'is-selected': selectedPlug === plug.id }">
                <Icon :name="selectedPlug === plug.id ? 'plugWhite' : 'plugGray'" size="26px" />
              </div>

              <!-- Plug Details -->
              <div class="plug-info">
                <span class="plug-name">{{ plug.name }}</span>
                <div class="plug-status">
                  <span class="status-dot"></span>
                  <span class="status-text">{{ plug.status }}</span>
                </div>
              </div>

              <!-- Selection Checkmark -->
              <div class="plug-check">
                <svg
                  v-if="selectedPlug === plug.id"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10.5" stroke="#2563eb" stroke-width="2.2" />
                  <path
                    d="M7.5 12.2L10.5 15.2L16.5 9.2"
                    stroke="#2563eb"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </ion-card-content>
        <div class="modal-footer">
          <AppButton label="Contiue" expand="block" />
        </div>
      </ion-card>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
  ion-modal {
    --width: 100%;
    --max-width: 100%;
    --border-radius: 24px 24px 0 0;
  }

  ion-modal::part(content) {
    width: 100%;
    max-width: 100%;
    border-radius: 24px 24px 0 0;
  }

  ion-content {
    --padding-top: 0;
    --padding-bottom: 0;
    --padding-start: 0;
    --padding-end: 0;
    --background: #ffffff;
  }

  .modal-card {
    margin: 0;
    width: 100%;
    height: 100%;
    box-shadow: none;
    background: #ffffff;
    border-radius: 0;
  }

  .modal-header {
    padding: 16px 20px 8px;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .modal-subtitle {
    font-size: 14px;
    color: #64748b;
    display: block;
    margin-top: 4px;
  }

  .modal-body {
    padding: 8px 20px 8px;
  }

  .modal-footer {
    padding: 8px 20px 8px;
  }

  .plug-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .plug-card {
    display: flex;
    align-items: center;
    padding: 14px 18px;
    border-radius: 20px;
    border: 2px solid #e2e8f0;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .plug-card.is-selected {
    border-color: #2563eb;
    background: #ffffff;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.08);
  }

  .plug-icon-box {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 16px;
    transition: background-color 0.2s ease;
  }

  .plug-icon-box.is-selected {
    background: #2563eb;
  }

  .plug-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-grow: 1;
  }

  .plug-name {
    font-size: 17px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
  }

  .plug-status {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10b981;
    display: inline-block;
  }

  .status-text {
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    line-height: 1;
  }

  .plug-check {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
</style>
