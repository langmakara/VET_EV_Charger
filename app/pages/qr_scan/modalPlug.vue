<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import {
    IonModal,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonSpinner
  } from '@ionic/vue'
  import Icon from '~/components/Icon/icon.vue'
  import AppButton from '~/components/Button/AppButton.vue'
  import type { GunTypeData } from '~/api/types'

  export interface Plug {
    id: string
    name: string
    status: string
    isAvailable?: boolean
    raw?: any
  }

  const props = withDefaults(
    defineProps<{
      isOpen?: boolean
      guntype?: GunTypeData[] | any[]
      isLoading?: boolean
    }>(),
    {
      isOpen: false,
      guntype: () => [],
      isLoading: false
    }
  )

  const emit = defineEmits<{
    (e: 'didDismiss'): void
    (e: 'close'): void
    (e: 'select', plug: Plug): void
    (e: 'continue', plug: Plug): void
  }>()

  function isPlugAvailable(g: any): boolean {
    if (g.isAvailable === false || g.isAvailable === 0 || g.isAvailable === '0' || g.isAvailable === 'false') {
      return false
    }
    if (typeof g.status === 'string') {
      const s = g.status.trim().toLowerCase()
      if (['busy', 'occupied', 'charging', 'in use', 'offline', 'unavailable', 'out of order', 'closed'].includes(s)) {
        return false
      }
      if (['available', 'open', 'idle'].includes(s)) {
        return true
      }
    }
    if (g.isAvailable === true || g.isAvailable === 1 || g.isAvailable === '1' || g.isAvailable === 'true') {
      return true
    }
    return g.isAvailable !== false
  }

  // Map API guntype items
  const plugs = computed<Plug[]>(() => {
    const list = Array.isArray(props.guntype) ? props.guntype : []
    return list.map((g: any, index: number) => {
      const id = String(g.gunId ?? g.id ?? `plug-${index + 1}`)
      const name = g.gunName ?? g.name ?? `Plug ${index + 1}`
      const isAvailable = isPlugAvailable(g)
      const status = isAvailable ? 'Available' : 'Busy'
      return {
        id,
        name,
        status,
        isAvailable,
        raw: g
      }
    })
  })

  const selectedPlug = ref<string>('')

  // Selected plug object that is guaranteed to be available
  const selectedAvailablePlug = computed(() => {
    return plugs.value.find((p) => p.id === selectedPlug.value && p.isAvailable) || null
  })

  // Automatically select the first available plug when plugs load/change
  watch(
    () => plugs.value,
    (newPlugs) => {
      if (newPlugs.length > 0) {
        const currentValid = newPlugs.find((p) => p.id === selectedPlug.value && p.isAvailable)
        if (!currentValid) {
          const firstAvailable = newPlugs.find((p) => p.isAvailable)
          selectedPlug.value = firstAvailable ? firstAvailable.id : ''
        }
      } else {
        selectedPlug.value = ''
      }
    },
    { immediate: true }
  )

  function handleSelect(plug: Plug) {
    if (!plug.isAvailable) return
    selectedPlug.value = plug.id
    emit('select', plug)
  }

  function handleContinue() {
    if (!selectedAvailablePlug.value) return
    emit('continue', selectedAvailablePlug.value)
  }
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    mode="ios"
    :handle="true"
    @didDismiss="emit('didDismiss')"
    :initial-breakpoint="0.45"
    :breakpoints="[0, 0.45]"
  >
    <ion-content class="ion-no-padding">
      <ion-card class="modal-card">
        <ion-card-header class="modal-header">
          <ion-card-title class="modal-title">Plug Selection</ion-card-title>
          <ion-text class="modal-subtitle">Select your preferred plug type</ion-text>
        </ion-card-header>

        <ion-card-content class="modal-body">
          <!-- Loading state -->
          <div v-if="isLoading && plugs.length === 0" class="loading-box">
            <ion-spinner name="crescent" color="primary" />
            <p>Loading available plugs...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="plugs.length === 0" class="loading-box">
            <p>No plugs found for this charger.</p>
          </div>

          <!-- Plug list -->
          <div v-else class="plug-list">
            <div
              v-for="plug in plugs"
              :key="plug.id"
              class="plug-card"
              :class="{
                'is-selected': selectedPlug === plug.id && plug.isAvailable,
                'is-disabled': !plug.isAvailable,
                'is-busy': !plug.isAvailable
              }"
              @click="handleSelect(plug)"
            >
              <!-- Icon Badge Box -->
              <div
                class="plug-icon-box"
                :class="{ 'is-selected': selectedPlug === plug.id && plug.isAvailable }"
              >
                <Icon
                  :name="selectedPlug === plug.id && plug.isAvailable ? 'plugWhite' : 'plugGray'"
                  size="26px"
                />
              </div>

              <!-- Plug Details -->
              <div class="plug-info">
                <span class="plug-name">{{ plug.name }}</span>
                <div class="plug-status">
                  <span
                    class="status-dot"
                    :class="{ 'is-busy': !plug.isAvailable }"
                  ></span>
                  <span
                    class="status-text"
                    :class="{ 'is-busy': !plug.isAvailable }"
                  >{{ plug.status }}</span>
                </div>
              </div>

              <!-- Selection Checkmark -->
              <div class="plug-check">
                <Icon
                  v-if="selectedPlug === plug.id && plug.isAvailable"
                  name="check-circle"
                  size="24px"
                  color="#2563eb"
                />
              </div>
            </div>
          </div>
        </ion-card-content>
        <div class="modal-footer">
          <AppButton
            label="Continue"
            expand="block"
            :disabled="!selectedAvailablePlug || (isLoading && plugs.length === 0)"
            @click="handleContinue"
          />
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

  .plug-card.is-disabled,
  .plug-card.is-busy {
    opacity: 0.55;
    cursor: not-allowed;
    background: #f8fafc;
    border-color: #e2e8f0;
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

  .status-dot.is-busy {
    background-color: #ef4444;
  }

  .status-text {
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    line-height: 1;
  }

  .status-text.is-busy {
    color: #ef4444;
  }

  .plug-check {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    gap: 8px;
    color: #64748b;
    font-size: 14px;
  }
</style>
