<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { IonModal } from '@ionic/vue'
  import VoucherCard from '~/components/Card/VoucherCard.vue'
  import evData from '~/data/ev_charger_data.json'
  import type { Voucher } from '~/types/ev-charger'
  import AppInputField from '~/components/Controls/AppInputField.vue'
  import IconButton from '~/components/Button/IconButton.vue'

  export interface VoucherModalItem {
    id: number | string
    discountRate: string
    conditions: string
    voucherLabel: string
    voucherExpiry: string
    voucherDescription?: string
    isActive?: boolean
    code?: string
  }

  const props = withDefaults(
    defineProps<{
      isOpen?: boolean
      selectedId?: number | string | null
      selectedPercent?: number
      vouchers?: VoucherModalItem[]
    }>(),
    {
      isOpen: false,
      selectedId: 1,
      selectedPercent: 5,
      vouchers: () => [
        {
          id: 1,
          discountRate: '5.0%',
          conditions: '5% off with any charge',
          voucherLabel: 'Voucher Code',
          voucherExpiry: 'Valid Till - 31 December 2024',
          isActive: true
        },
        {
          id: 2,
          discountRate: '5.0%',
          conditions: '5% off with any charge',
          voucherLabel: 'Voucher Code',
          voucherExpiry: 'Valid Till - 31 December 2024',
          isActive: true
        }
      ]
    }
  )

  const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void
    (e: 'close'): void
    (e: 'didDismiss'): void
    (e: 'cancel'): void
    (e: 'scan'): void
    (e: 'select', voucher: VoucherModalItem): void
    (e: 'apply', payload: { voucher: VoucherModalItem | null; percent: number; code: string }): void
  }>()

  // List of available vouchers (fallback to ev_charger_data if empty)
  const voucherList = computed<VoucherModalItem[]>(() => {
    if (props.vouchers && props.vouchers.length > 0) {
      return props.vouchers
    }
    if (evData?.vouchers && evData.vouchers.length > 0) {
      return evData.vouchers as VoucherModalItem[]
    }
    return []
  })

  // Input field code state
  const voucherInputCode = ref('')
  const selectedVoucherId = ref<number | string | null>(props.selectedId ?? 1)

  // Synchronize state when modal opens
  watch(
    () => props.isOpen,
    (open) => {
      if (open) {
        selectedVoucherId.value = props.selectedId ?? 1
        const initial = voucherList.value.find((v) => v.id === selectedVoucherId.value)
        voucherInputCode.value = initial?.voucherLabel || ''
      }
    },
    { immediate: true }
  )

  // Select card handler
  const handleSelectVoucher = (voucher: VoucherModalItem) => {
    selectedVoucherId.value = voucher.id
    voucherInputCode.value = voucher.voucherLabel || `${voucher.discountRate} OFF`
    emit('select', voucher)
  }

  // Format discount highlight text (e.g., '5.0%' -> '5% OFF')
  const formatHighlightRate = (rate: string) => {
    const cleaned = rate.replace('.0%', '%')
    return cleaned.includes('OFF') ? cleaned : `${cleaned} OFF`
  }

  // Parse discount percentage number from voucher or input
  const extractPercent = (voucher: VoucherModalItem | null, rawCode: string): number => {
    if (voucher?.discountRate) {
      const match = voucher.discountRate.match(/(\d+(\.\d+)?)/)
      if (match) return parseFloat(match[1])
    }
    const codeMatch = rawCode.match(/(\d+(\.\d+)?)/)
    if (codeMatch) return parseFloat(codeMatch[1])
    return props.selectedPercent || 5
  }

  // Close and dismiss
  const handleClose = () => {
    emit('update:isOpen', false)
    emit('close')
  }

  const handleCancel = () => {
    emit('cancel')
    handleClose()
  }

  const handleDismiss = () => {
    emit('didDismiss')
    emit('update:isOpen', false)
    emit('close')
  }

  // QR / Barcode Scanner action
  const handleScan = () => {
    emit('scan')
    handleClose()
    navigateTo('/ev_charger/voucher/camera')
  }

  // Apply Voucher action
  const handleApply = () => {
    const selected = voucherList.value.find((v) => v.id === selectedVoucherId.value) || null
    const percent = extractPercent(selected, voucherInputCode.value)
    emit('apply', {
      voucher: selected,
      percent,
      code: voucherInputCode.value.trim()
    })
    handleClose()
  }
  const handlescanVouchercode = () => {
    navigateTo('/ev_charger/voucher/camera')
    handleClose()
  }
</script>

<template>
  <ion-modal :is-open="isOpen" class="voucher-modal" @didDismiss="handleDismiss">
    <div class="voucher-modal-container">
      <!-- Modal Header: Title & Close Button -->
      <div class="modal-header">
        <h2 class="modal-title">Apply Voucher</h2>
        <IconButton buttonType="close" size="md" @click="handleClose" />
      </div>

      <!-- Search Code Input & QR Scanner Row -->
      <ion-grid columns="2" class="voucher-grid">
        <ion-row>
          <ion-col>
            <AppInputField
              v-model="voucherInputCode"
              label="Enter or scan voucher code"
              placeholder="Code"
            />
          </ion-col>
          <ion-col size="auto" class="btn-container">
            <IconButton buttonType="scan" size="lg" @click="handlescanVouchercode" />
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Vouchers List -->
      <div class="vouchers-list">
        <VoucherCard
          v-for="voucher in voucherList"
          :key="voucher.id"
          :discount-rate="voucher.discountRate"
          :conditions="voucher.conditions"
          :voucher-label="voucher.voucherLabel"
          :voucher-expiry="voucher.voucherExpiry"
          :voucher-description="voucher.voucherDescription"
          :is-active="voucher.isActive"
          :class="{ 'is-selected': selectedVoucherId === voucher.id }"
          @click="handleSelectVoucher(voucher)"
        />
      </div>

      <!-- Action Buttons: Cancel & Apply -->
      <div class="modal-actions">
        <button type="button" class="action-btn btn-cancel" @click="handleCancel">Cancel</button>
        <button type="button" class="action-btn btn-apply" @click="handleApply">Apply</button>
      </div>
    </div>
  </ion-modal>
</template>

<style scoped>
  .voucher-modal-container {
    background-color: #ffffff;
    padding: 18px 18px 20px 18px;
    border-radius: 18px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* 1. Header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .modal-title {
    color: #1f2937;
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.2px;
  }

  .close-button {
    background: transparent;
    border: none;
    color: #4b5563;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .close-button:hover {
    background-color: #f3f4f6;
    color: #111827;
  }

  .close-button:active {
    background-color: #e5e7eb;
  }

  /* 2. Search & Scan Row */
  .search-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .input-wrapper {
    flex: 1;
  }

  .code-input {
    width: 100%;
    height: 46px;
    background-color: #ffffff;
    border: 1.5px solid #d8dee4;
    border-radius: 8px;
    padding: 0 14px;
    font-size: 15px;
    color: #1f2937;
    box-sizing: border-box;
    outline: none;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .code-input::placeholder {
    color: #9ca3af;
  }

  .code-input:focus {
    border-color: #2b3be5;
    box-shadow: 0 0 0 3px rgba(43, 59, 229, 0.12);
  }

  .scan-button {
    width: 46px;
    height: 46px;
    background-color: #2b3be5;
    border: none;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition:
      transform 0.1s ease,
      filter 0.15s ease;
  }

  .scan-button:active {
    transform: scale(0.95);
    filter: brightness(0.92);
  }

  /* 3. Vouchers List */
  .vouchers-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 290px;
    overflow-y: auto;
    padding: 2px 1px;
  }

  /* Custom subtle scrollbar */
  .vouchers-list::-webkit-scrollbar {
    width: 4px;
  }

  .vouchers-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .vouchers-list::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 4px;
  }

  /* 4. Voucher Card Overrides in Modal */
  :deep(.modal-voucher-item) {
    margin: 0 !important;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.1s ease;
  }

  :deep(.modal-voucher-item:hover) {
    border-color: #cbd5e1;
  }

  :deep(.modal-voucher-item.is-selected) {
    border-color: #df5204 !important;
    box-shadow: 0 0 0 1.5px #df5204 !important;
  }

  :deep(.modal-voucher-item:active) {
    transform: scale(0.99);
  }

  /* 5. Bottom Action Buttons */
  .modal-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 18px;
  }

  .action-btn {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      transform 0.1s ease;
  }

  .btn-cancel {
    background-color: #ffffff;
    border: 1.5px solid #d8dee4;
    color: #334155;
  }

  .btn-cancel:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }

  .btn-cancel:active {
    background-color: #f1f5f9;
  }

  .btn-apply {
    background-color: #de5204;
    border: none;
    color: #ffffff;
  }

  .btn-apply:hover {
    background-color: #d04b03;
  }

  .btn-apply:active {
    transform: scale(0.98);
    background-color: #be4402;
  }
  .voucher-grid {
    padding: 10px 0;
    width: 100%;
  }
</style>

<style>
  /* Global modal container overrides for centered presentation */
  ion-modal.voucher-modal {
    --width: 90%;
    --max-width: 360px;
    --height: auto;
    --border-radius: 18px;
    --background: transparent;
    --box-shadow: none;
  }

  ion-modal.voucher-modal::part(content) {
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  .btn-container {
    display: flex;
    align-items: flex-end;
    padding-bottom: 5px;
    padding-right: 5px;
  }
</style>
