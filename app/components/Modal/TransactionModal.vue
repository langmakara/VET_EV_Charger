<script setup lang="ts">
import { computed, useSlots } from 'vue'
import {
  IonModal,
  IonContent,
  IonSpinner,
  IonButton
} from '@ionic/vue'
import { useSaleOrderDetailQuery } from '~/composables/queries/useSaleOrder'
import type { SaleOrderDetailData } from '~/api/types'

const props = withDefaults(
  defineProps<{
    isOpen?: boolean
    title?: string
    transactionId?: string | number
    item?: SaleOrderDetailData | any
    type?: 'transaction' | 'session' | 'auto'
    initialBreakpoint?: number
    breakpoints?: number[]
  }>(),
  {
    isOpen: false,
    title: '',
    transactionId: '',
    item: null,
    type: 'auto',
    initialBreakpoint: 0.65,
    breakpoints: () => [0, 0.65, 0.9, 1]
  }
)

const emit = defineEmits<{
  (e: 'did-dismiss'): void
  (e: 'close'): void
  (e: 'update:isOpen', value: boolean): void
}>()

const slots = useSlots()
const hasDefaultSlot = computed(() => !!slots.default)

// Reactive transactionId as string
const activeTransactionId = computed(() => {
  if (props.transactionId !== undefined && props.transactionId !== null && props.transactionId !== '') {
    return String(props.transactionId)
  }
  if (props.item?.transactionId) {
    return String(props.item.transactionId)
  }
  return ''
})

// Query sale order detail only if transactionId exists and modal is open
const {
  data: queryDetail,
  isLoading,
  isError,
  error,
  refetch
} = useSaleOrderDetailQuery(activeTransactionId, {
  enabled: computed(() => props.isOpen && !!activeTransactionId.value)
})

// Resolved transaction data
const detail = computed<SaleOrderDetailData | any>(() => {
  return queryDetail.value || props.item || null
})

// Active detail mode: SESSION (Income, type: 1) and TRANSACTION DETAIL (Expend, type: 2)
const activeType = computed<'session' | 'transaction'>(() => {
  if (props.type === 'session') return 'session'
  if (props.type === 'transaction') return 'transaction'

  if (detail.value) {
    if (
      detail.value.type === 1 ||
      detail.value.typeName?.toLowerCase() === 'income' ||
      detail.value.typeName?.toLowerCase() === 'session' ||
      detail.value.typeName?.toLowerCase() === 'earn' ||
      detail.value.timeElapsed ||
      detail.value.energy ||
      detail.value.preAuthorisedAmount ||
      detail.value.finalChargingCost
    ) {
      return 'session'
    }
  }
  return 'transaction'
})

// Header Title: "Session Detail" (Income) or "Transaction Detail" (Expend)
const modalTitle = computed(() => {
  if (props.title) return props.title
  return activeType.value === 'session' ? 'Session Detail' : 'Transaction Detail'
})

// Helpers
function formatCurrency(val?: number): string {
  if (val == null || isNaN(val)) return ''
  const num = Math.abs(val)
  if (num >= 500) {
    return `KHR (៛) ${Math.round(num).toLocaleString()}`
  }
  return `$${num.toFixed(2)}`
}

function formatOrderDate(dateStr?: string): string {
  if (!dateStr) return ''
  const cleanStr = String(dateStr).replace(' ', 'T')
  const date = new Date(cleanStr)
  if (isNaN(date.getTime())) return String(dateStr)

  const day = String(date.getDate()).padStart(2, '0')
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const formattedHours = String(hours).padStart(2, '0')

  return `${day} ${month} ${year} ${formattedHours}:${minutes}${ampm}`
}

// Display Fields
const displayTransactionId = computed(() => {
  if (detail.value?.transactionId) return String(detail.value.transactionId)
  if (detail.value?.soCode) return String(detail.value.soCode)
  if (detail.value?.id) return String(detail.value.id).padStart(5, '0')
  return activeTransactionId.value || '00001'
})

const displayStationName = computed(() => {
  return detail.value?.stationName || detail.value?.description || detail.value?.title || 'EV Station'
})

const displayOrderDate = computed(() => {
  const d =
    detail.value?.orderDate ||
    detail.value?.createdDate ||
    detail.value?.created ||
    detail.value?.datetime
  return formatOrderDate(d)
})

// Subtotal & Discount calculations
const displaySubTotal = computed(() => {
  const price =
    detail.value?.totalPrice ??
    detail.value?.subTotal ??
    detail.value?.chargeAmount ??
    detail.value?.totalAmount
  return formatCurrency(price) || 'KHR (៛) 0'
})

const discountInfo = computed(() => {
  if (detail.value?.discount != null && detail.value.discount > 0) {
    const rawPct = detail.value.discountPercent
    const pctLabel = rawPct
      ? `Discount (${String(rawPct).includes('%') ? rawPct : `${rawPct}%`})`
      : 'Discount'
    return {
      hasDiscount: true,
      label: pctLabel,
      value: `-KHR (៛) ${Number(detail.value.discount).toLocaleString()}`
    }
  }

  const sub = Number(detail.value?.totalPrice ?? detail.value?.subTotal ?? 0)
  const total = Number(detail.value?.totalAmount ?? detail.value?.chargeAmount ?? 0)
  if (sub > total && total > 0) {
    const diff = sub - total
    const pct = Math.round((diff / sub) * 100)
    return {
      hasDiscount: true,
      label: `Discount (${pct}%)`,
      value: `-KHR (៛) ${diff.toLocaleString()}`
    }
  }

  return { hasDiscount: false, label: 'Discount', value: '' }
})

const displayTotalAmount = computed(() => {
  const total =
    detail.value?.totalAmount ??
    detail.value?.chargeAmount ??
    detail.value?.totalPrice
  return formatCurrency(total) || 'KHR (៛) 0'
})

const displayTotalKwh = computed(() => {
  if (detail.value?.totalKwh != null) {
    return `${detail.value.totalKwh} kWh`
  }
  if (detail.value?.kwh != null) {
    return `${detail.value.kwh} kWh`
  }
  return ''
})

const displayPointSpend = computed(() => {
  const pts = detail.value?.pointSpend ?? detail.value?.points
  if (pts != null && Number(pts) !== 0) {
    return `- ${Math.abs(Number(pts)).toLocaleString()} Points`
  }
  return ''
})

const displayPointEarned = computed(() => {
  const pts = detail.value?.points
  if (pts != null && Number(pts) > 0) {
    return `+ ${Number(pts).toLocaleString()} Points`
  }
  return ''
})

const displayPaymentMethod = computed(() => {
  return detail.value?.paymentMethodName || ''
})

// Session details
const displayTimeElapsed = computed(() => detail.value?.timeElapsed || '')
const displayEnergy = computed(() =>
  detail.value?.energy || (detail.value?.totalKwh ? `${detail.value.totalKwh} kWh` : '')
)
const displayPreAuthorised = computed(() =>
  formatCurrency(detail.value?.preAuthorisedAmount ?? detail.value?.totalAmount)
)
const displayFinalChargingCost = computed(() =>
  formatCurrency(
    detail.value?.finalChargingCost ?? detail.value?.chargeAmount ?? detail.value?.totalAmount
  )
)

const dismiss = () => {
  emit('did-dismiss')
  emit('close')
  emit('update:isOpen', false)
}
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="initialBreakpoint"
    :breakpoints="breakpoints"
    :handle="false"
    class="transaction-sheet-modal"
    @didDismiss="dismiss"
  >
    <ion-content class="detail-modal-content" :scroll-y="true">
      <div class="detail-sheet-container">
        <!-- Header -->
        <div class="detail-header">
          <div class="header-spacer" />
          <h2 class="detail-title">
            <slot name="title">{{ modalTitle }}</slot>
          </h2>
          <button
            type="button"
            class="close-button"
            aria-label="Close"
            @click="dismiss"
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

        <!-- Custom Slot override if provided by parent -->
        <slot v-if="hasDefaultSlot" :item="detail" :type="activeType" />

        <!-- Loading state -->
        <div v-else-if="isLoading && !detail" class="loading-container">
          <ion-spinner name="crescent" color="primary" />
          <span>Loading detail...</span>
        </div>

        <!-- Error state -->
        <div v-else-if="isError && !detail" class="error-container">
          <p>{{ (error as any)?.message || 'Failed to load transaction detail' }}</p>
          <ion-button fill="clear" size="small" @click="() => refetch()">
            Retry
          </ion-button>
        </div>

        <!-- Details list -->
        <div v-else-if="detail" class="detail-list">
          <!-- Common: Transaction id -->
          <div class="detail-row">
            <span class="row-label">Transaction id</span>
            <span class="row-value">{{ displayTransactionId }}</span>
          </div>

          <!-- SESSION DETAIL (Income) -->
          <template v-if="activeType === 'session'">
            <div v-if="displayStationName" class="detail-row">
              <span class="row-label">Station Name</span>
              <span class="row-value">{{ displayStationName }}</span>
            </div>
            <div v-if="displayOrderDate" class="detail-row">
              <span class="row-label">Order Date</span>
              <span class="row-value">{{ displayOrderDate }}</span>
            </div>
            <div v-if="displayTimeElapsed" class="detail-row">
              <span class="row-label">Time Elapsed</span>
              <span class="row-value">{{ displayTimeElapsed }}</span>
            </div>
            <div v-if="displayEnergy" class="detail-row">
              <span class="row-label">Energy</span>
              <span class="row-value">{{ displayEnergy }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">Pre-authorised amount</span>
              <span class="row-value">{{ displayPreAuthorised }}</span>
            </div>
            <div class="detail-row is-last">
              <span class="row-label">Final charging cost</span>
              <span class="row-value is-bold">{{ displayFinalChargingCost }}</span>
            </div>
          </template>

          <!-- TRANSACTION DETAIL (Expend) -->
          <template v-else>
            <div v-if="displayStationName" class="detail-row">
              <span class="row-label">Station Name</span>
              <span class="row-value">{{ displayStationName }}</span>
            </div>
            <div v-if="displayOrderDate" class="detail-row">
              <span class="row-label">Order Date</span>
              <span class="row-value">{{ displayOrderDate }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">Sub Total</span>
              <span class="row-value">{{ displaySubTotal }}</span>
            </div>
            <div v-if="discountInfo.hasDiscount" class="detail-row">
              <span class="row-label">{{ discountInfo.label }}</span>
              <span class="row-value is-red">{{ discountInfo.value }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">Total Amount</span>
              <span class="row-value is-bold">{{ displayTotalAmount }}</span>
            </div>
            <div v-if="displayTotalKwh" class="detail-row">
              <span class="row-label">Total kWh</span>
              <span class="row-value is-bold">{{ displayTotalKwh }}</span>
            </div>
            <div v-if="displayPointSpend" class="detail-row">
              <span class="row-label">Point Spend</span>
              <span class="row-value is-red">{{ displayPointSpend }}</span>
            </div>
            <div v-if="displayPaymentMethod" class="detail-row">
              <span class="row-label">Payment Method</span>
              <span class="row-value">{{ displayPaymentMethod }}</span>
            </div>
          </template>
        </div>

        <div v-else class="empty-detail">
          <p>No transaction detail found.</p>
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

.detail-row.is-last,
.detail-row:last-child {
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

.row-value.is-green {
  font-weight: 500;
  color: #22a15b;
}

.loading-container,
.error-container,
.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  gap: 12px;
  color: #8c92a0;
  font-size: 14px;
  text-align: center;
}
</style>

<style>
/* Global modal container overrides for Ionic sheet modal */
ion-modal.transaction-sheet-modal {
  --background: #ffffff;
  --border-radius: 20px 20px 0 0;
  --backdrop-opacity: 0.5;
}

ion-modal.transaction-sheet-modal::part(content) {
  border-radius: 20px 20px 0 0;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
}

@media (min-width: 640px) {
  ion-modal.transaction-sheet-modal {
    --width: 420px;
    --max-width: 90%;
    --border-radius: 20px;
  }

  ion-modal.transaction-sheet-modal::part(content) {
    border-radius: 20px;
  }
}
</style>
