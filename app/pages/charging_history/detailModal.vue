<script setup lang="ts">
import { computed } from 'vue'
import { IonModal, IonContent } from '@ionic/vue'

import type { HistoryDetailItem } from '~/types'

export type { HistoryDetailItem }

const props = withDefaults(
  defineProps<{
    isOpen?: boolean
    type?: 'transaction' | 'session' | 'auto'
    title?: string
    item?: HistoryDetailItem | null
    initialBreakpoint?: number
    breakpoints?: number[]
  }>(),
  {
    isOpen: false,
    type: 'auto',
    title: '',
    item: null,
    initialBreakpoint: undefined,
    breakpoints: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'close'): void
  (e: 'didDismiss'): void
}>()

// Determine active detail type ('transaction' or 'session')
const activeType = computed<'transaction' | 'session'>(() => {
  if (props.type === 'transaction') return 'transaction'
  if (props.type === 'session') return 'session'

  if (props.item) {
    if (props.item.mode === 'session' || props.item.mode === 'transaction') {
      return props.item.mode
    }
    // Auto detect session if specific session fields exist or title indicates session
    if (
      props.item.timeElapsed ||
      props.item.energy ||
      props.item.finalChargingCost ||
      props.item.preAuthorisedAmount ||
      props.item.title?.toLowerCase().includes('session') ||
      props.item.type === 'session' ||
      props.item.type === 'earned'
    ) {
      return 'session'
    }
  }

  return 'transaction'
})

// Header Title
const modalTitle = computed(() => {
  if (props.title) return props.title
  return activeType.value === 'session' ? 'Session Detail' : 'Transaction Detail'
})

// Responsive Breakpoints for Ionic Bottom Sheet
const currentInitialBreakpoint = computed(() => {
  if (props.initialBreakpoint !== undefined) return props.initialBreakpoint
  return activeType.value === 'session' ? 0.58 : 0.65
})

const currentBreakpoints = computed(() => {
  if (props.breakpoints && props.breakpoints.length > 0) return props.breakpoints
  const init = currentInitialBreakpoint.value
  return [0, init, 1]
})

// Common Display Formats
const displayTransactionId = computed(() => {
  if (props.item?.transactionId !== undefined) {
    return String(props.item.transactionId).padStart(5, '0')
  }
  if (props.item?.id !== undefined) {
    return String(props.item.id).padStart(5, '0')
  }
  return '00001'
})

const displayStationName = computed(() => {
  return props.item?.stationName || props.item?.title
})

const displayOrderDate = computed(() => {
  return props.item?.orderDate || props.item?.datetime 
})

// Transaction Detail Values (Image 1)
const displaySubTotal = computed(() => {
  if (props.item?.subTotal !== undefined) {
    return typeof props.item.subTotal === 'number'
      ? `KHR (៛) ${props.item.subTotal.toLocaleString()}`
      : String(props.item.subTotal)
  }
  return 'KHR (៛) 48,000'
})

const displayDiscountLabel = computed(() => {
  if (props.item?.discountPercent) {
    const raw = String(props.item.discountPercent)
    return `Discount (${raw.includes('%') ? raw : `${raw}%`})`
  }
  return 'Discount (20%)'
})

const displayDiscountValue = computed(() => {
  if (props.item?.discount !== undefined) {
    return typeof props.item.discount === 'number'
      ? `-KHR (៛) ${Math.abs(props.item.discount).toLocaleString()}`
      : String(props.item.discount)
  }
  return '-KHR (៛) 4,000'
})

const displayTotalAmount = computed(() => {
  if (props.item?.totalAmount !== undefined) {
    return typeof props.item.totalAmount === 'number'
      ? `KHR (៛) ${props.item.totalAmount.toLocaleString()}`
      : String(props.item.totalAmount)
  }
  return 'KHR (៛) 44,000'
})

const displayTotalKwh = computed(() => {
  if (props.item?.totalKwh !== undefined) {
    return typeof props.item.totalKwh === 'number'
      ? `${props.item.totalKwh} kWh`
      : String(props.item.totalKwh)
  }
  return '20 kWh'
})

const displayPointSpend = computed(() => {
  if (props.item?.pointSpend !== undefined) {
    return String(props.item.pointSpend)
  }
  if (props.item?.points !== undefined) {
    const pts = Math.abs(props.item.points).toLocaleString()
    return `- ${pts} Points`
  }
  return '- 2,000 Points'
})

// Session Detail Values (Image 2)
const displayTimeElapsed = computed(() => {
  return props.item?.timeElapsed || '14 mins'
})

const displayEnergy = computed(() => {
  return props.item?.energy || '6 / 15 kWh'
})

const displayPreAuthorised = computed(() => {
  if (props.item?.preAuthorisedAmount !== undefined) {
    return typeof props.item.preAuthorisedAmount === 'number'
      ? `KHR (៛) ${props.item.preAuthorisedAmount.toLocaleString()}`
      : String(props.item.preAuthorisedAmount)
  }
  return 'KHR (៛) 44,000'
})

const displayFinalChargingCost = computed(() => {
  if (props.item?.finalChargingCost !== undefined) {
    return typeof props.item.finalChargingCost === 'number'
      ? `KHR (៛) ${props.item.finalChargingCost.toLocaleString()}`
      : String(props.item.finalChargingCost)
  }
  return 'KHR (៛) 20,000'
})

// Close handlers
const handleClose = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleDismiss = () => {
  emit('update:isOpen', false)
  emit('close')
  emit('didDismiss')
}
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="currentInitialBreakpoint"
    :breakpoints="currentBreakpoints"
    :handle="false"
    class="detail-sheet-modal"
    @didDismiss="handleDismiss"
  >
    <ion-content class="detail-modal-content" :scroll-y="false">
      <div class="detail-sheet-container">
        <!-- Top Header Bar -->
        <div class="detail-header">
          <div class="header-spacer" />
          <h2 class="detail-title">
            <slot name="title">{{ modalTitle }}</slot>
          </h2>
          <button
            type="button"
            class="close-button"
            aria-label="Close"
            @click="handleClose"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Detail Rows List -->
        <div class="detail-list">
          <slot :item="item" :type="activeType">
            <!-- Common Field 1: Transaction id -->
            <div class="detail-row">
              <span class="row-label">Transaction id</span>
              <span class="row-value">{{ displayTransactionId }}</span>
            </div>

            <!-- Common Field 2: Station Name -->
            <div class="detail-row">
              <span class="row-label">Station Name</span>
              <span class="row-value">{{ displayStationName }}</span>
            </div>

            <!-- Common Field 3: Order Date -->
            <div class="detail-row">
              <span class="row-label">Order Date</span>
              <span class="row-value">{{ displayOrderDate }}</span>
            </div>

            <!-- TRANSACTION DETAIL ROWS (Image 1) -->
            <template v-if="activeType === 'transaction'">
              <!-- Sub Total -->
              <div class="detail-row">
                <span class="row-label">Sub Total</span>
                <span class="row-value">{{ displaySubTotal }}</span>
              </div>

              <!-- Discount -->
              <div class="detail-row">
                <span class="row-label">{{ displayDiscountLabel }}</span>
                <span class="row-value">{{ displayDiscountValue }}</span>
              </div>

              <!-- Total Amount -->
              <div class="detail-row">
                <span class="row-label">Total Amout</span>
                <span class="row-value is-bold">{{ displayTotalAmount }}</span>
              </div>

              <!-- Total kWh -->
              <div class="detail-row">
                <span class="row-label">Total kWh</span>
                <span class="row-value is-bold">{{ displayTotalKwh }}</span>
              </div>

              <!-- Point Spend -->
              <div class="detail-row is-last">
                <span class="row-label">Point Spend</span>
                <span class="row-value is-red">{{ displayPointSpend }}</span>
              </div>
            </template>

            <!-- SESSION DETAIL ROWS (Image 2) -->
            <template v-else>
              <!-- Time Elapsed -->
              <div class="detail-row">
                <span class="row-label">Time Elapsed</span>
                <span class="row-value">{{ displayTimeElapsed }}</span>
              </div>

              <!-- Energy -->
              <div class="detail-row">
                <span class="row-label">Energy</span>
                <span class="row-value">{{ displayEnergy }}</span>
              </div>

              <!-- Pre-authorised amount -->
              <div class="detail-row">
                <span class="row-label">Pre-authorised amount</span>
                <span class="row-value">{{ displayPreAuthorised }}</span>
              </div>

              <!-- Final charging cost -->
              <div class="detail-row is-last">
                <span class="row-label">Final charging cost</span>
                <span class="row-value is-bold">{{ displayFinalChargingCost }}</span>
              </div>
            </template>
          </slot>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.detail-modal-content {
  --background: #ffffff;
  background: #ffffff;
}

.detail-sheet-container {
  background-color: #ffffff;
  padding: 18px 20px 28px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  position: relative;
}

.header-spacer {
  width: 32px;
  height: 32px;
}

.detail-title {
  font-size: 16.5px;
  font-weight: 600;
  color: #1e2430;
  letter-spacing: -0.2px;
  text-align: center;
  margin: 0;
  flex: 1;
}

.close-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  color: #1e2430;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #0f172a;
}

.close-button:active {
  background-color: #e5e7eb;
}

/* Detail Rows List */
.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14.5px 0;
  border-bottom: 1px solid #f1f3f6;
  box-sizing: border-box;
}

.detail-row.is-last {
  border-bottom: none;
}

.row-label {
  font-size: 15px;
  font-weight: 400;
  color: #7d8597;
  letter-spacing: -0.1px;
}

.row-value {
  font-size: 15px;
  font-weight: 400;
  color: #1e2430;
  text-align: right;
  letter-spacing: -0.1px;
}

.row-value.is-bold {
  font-weight: 700;
  color: #111827;
}

.row-value.is-red {
  font-weight: 500;
  color: #f04438;
}
</style>

<style>
/* Global modal container overrides for Ionic sheet modal */
ion-modal.detail-sheet-modal {
  --background: #ffffff;
  --border-radius: 20px 20px 0 0;
  --backdrop-opacity: 0.5;
}

ion-modal.detail-sheet-modal::part(content) {
  border-radius: 20px 20px 0 0;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
}

@media (min-width: 640px) {
  ion-modal.detail-sheet-modal {
    --width: 420px;
    --max-width: 90%;
    --border-radius: 20px;
  }

  ion-modal.detail-sheet-modal::part(content) {
    border-radius: 20px;
  }
}
</style>
