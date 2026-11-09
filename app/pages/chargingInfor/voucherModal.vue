<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { IonModal, IonGrid, IonRow, IonCol } from '@ionic/vue'
  import VoucherCard from '~/components/Card/VoucherCard.vue'
  import type { VoucherDate } from '~/api/types'
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
      selectedVoucher?: VoucherDate | null
      selectedPercent?: number
      voucherlist?: VoucherDate[] | any[]
      vouchers?: VoucherDate[] | any[]
    }>(),
    {
      isOpen: false,
      selectedId: null,
      selectedVoucher: null,
      selectedPercent: 0,
      voucherlist: () => [],
      vouchers: () => []
    }
  )

  const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void
    (e: 'close'): void
    (e: 'didDismiss'): void
    (e: 'cancel'): void
    (e: 'scan'): void
    (e: 'select', voucher: VoucherDate): void
    (e: 'apply', payload: { voucher: VoucherDate | null; percent: number; code: string }): void
  }>()

  // List of available vouchers from props
  const voucherList = computed<VoucherDate[]>(() => {
    if (Array.isArray(props.voucherlist) && props.voucherlist.length > 0) {
      return props.voucherlist
    }
    if (Array.isArray(props.vouchers) && props.vouchers.length > 0) {
      return props.vouchers
    }
    return []
  })

  // Input field code state
  const voucherInputCode = ref('')
  const selectedVoucherId = ref<number | string | null>(null)

  // Filtered vouchers based on search/code input
  const displayedVouchers = computed<VoucherDate[]>(() => {
    const q = voucherInputCode.value.trim().toLowerCase()
    if (!q) return voucherList.value
    return voucherList.value.filter((v) => {
      const code = (v.voucherCode || '').toLowerCase()
      const title = (v.batchTitle || '').toLowerCase()
      return code.includes(q) || title.includes(q)
    })
  })

  function isVoucherSelected(voucher: VoucherDate): boolean {
    if (selectedVoucherId.value == null || selectedVoucherId.value === '') return false
    const sel = String(selectedVoucherId.value).toLowerCase()
    if (voucher.voucherId != null && String(voucher.voucherId).toLowerCase() === sel) return true
    if (voucher.id != null && String(voucher.id).toLowerCase() === sel) return true
    if (voucher.voucherCode && String(voucher.voucherCode).toLowerCase() === sel) return true
    return false
  }

  // Synchronize state when modal opens
  watch(
    () => props.isOpen,
    (open) => {
      if (open) {
        selectedVoucherId.value =
          props.selectedVoucher?.voucherId ??
          props.selectedVoucher?.id ??
          props.selectedVoucher?.voucherCode ??
          props.selectedId ??
          null

        if (props.selectedVoucher) {
          voucherInputCode.value =
            props.selectedVoucher.voucherCode || props.selectedVoucher.batchTitle || ''
        } else if (selectedVoucherId.value != null) {
          const sel = String(selectedVoucherId.value).toLowerCase()
          const found = voucherList.value.find(
            (v) =>
              (v.voucherId != null && String(v.voucherId).toLowerCase() === sel) ||
              (v.id != null && String(v.id).toLowerCase() === sel) ||
              (v.voucherCode && String(v.voucherCode).toLowerCase() === sel)
          )
          voucherInputCode.value = found?.voucherCode || found?.batchTitle || ''
        } else {
          voucherInputCode.value = ''
        }
      }
    },
    { immediate: true }
  )

  // Select card handler
  const handleSelectVoucher = (voucher: VoucherDate) => {
    selectedVoucherId.value = voucher.id ?? voucher.voucherCode ?? null
    voucherInputCode.value = voucher.voucherCode || voucher.batchTitle || ''
    emit('select', voucher)
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
    const sel =
      selectedVoucherId.value != null ? String(selectedVoucherId.value).toLowerCase() : null
    const inputCode = voucherInputCode.value.trim().toLowerCase()

    const selected =
      voucherList.value.find((v) => {
        if (sel && v.id != null && String(v.id).toLowerCase() === sel) return true
        if (sel && v.voucherCode && String(v.voucherCode).toLowerCase() === sel) return true
        if (inputCode && v.voucherCode && String(v.voucherCode).toLowerCase() === inputCode)
          return true
        return false
      }) || null

    let percent = 0
    if (selected) {
      if (selected.discountType === 1 || selected.discountValue != null) {
        percent = Number(selected.discountValue ?? 0)
      }
    } else if (voucherInputCode.value.trim()) {
      const match = voucherInputCode.value.match(/(\d+(\.\d+)?)/)
      if (match) percent = parseFloat(match[1])
    }

    emit('apply', {
      voucher: selected,
      percent,
      code: voucherInputCode.value.trim()
    })
    handleClose()
  }

  const handlescanVouchercode = () => {
    emit('scan')
    handleClose()
    navigateTo('/ev_charger/voucher/camera')
  }
</script>

<template>
  <ion-modal :is-open="isOpen" class="voucher-modal" @didDismiss="handleDismiss">
    <div class="voucher-modal-container">
      <!-- Modal Header: Title & Close Button -->
      <div class="modal-header">
        <h2 class="modal-title">{{ $t('chargingInfor.applyVoucher') }}</h2>
        <IconButton buttonType="close" size="md" @click="handleClose" />
      </div>

      <!-- Search Code Input & QR Scanner Row -->
      <ion-grid columns="2" class="voucher-grid">
        <ion-row>
          <ion-col>
            <AppInputField
              v-model="voucherInputCode"
              :label="$t('evCharger.enterOrScanVoucherCode')"
              :placeholder="$t('evCharger.code')"
            />
          </ion-col>
          <ion-col size="auto" class="btn-container">
            <IconButton buttonType="scan" size="lg" @click="handlescanVouchercode" />
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Vouchers List -->
      <div class="vouchers-list">
        <div v-if="displayedVouchers.length === 0" class="no-vouchers">
          <p>
            {{ voucherInputCode?.trim() ? $t('evCharger.noVouchersMatch') : $t('evCharger.noVouchersAvailable') }}
          </p>
        </div>
        <div
          v-else
          v-for="voucher in displayedVouchers"
          :key="voucher.id || voucher.voucherCode"
          class="voucher-card-item"
          :class="{ 'is-selected': isVoucherSelected(voucher) }"
          @click="handleSelectVoucher(voucher)"
        >
          <VoucherCard
            :voucher="voucher"
            class="modal-voucher-item"
            :class="{ 'is-selected': isVoucherSelected(voucher) }"
            @click="handleSelectVoucher(voucher)"
          />
        </div>
      </div>

      <!-- Action Buttons: Cancel & Apply -->
      <div class="modal-actions">
        <button type="button" class="action-btn btn-cancel" @click="handleCancel">{{ $t('common.cancel') }}</button>
        <button type="button" class="action-btn btn-apply" @click="handleApply">{{ $t('common.apply') }}</button>
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
  .voucher-card-item {
    cursor: pointer;
    border-radius: 14px;
    transition: all 0.2s ease;
  }

  /* .voucher-card-item.is-selected {
    border: 1px solid var(--ion-color-primary);
  } */

  :deep(.modal-voucher-item) {
    margin: 0 !important;
    border-radius: 12px;
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
  }

  :deep(.modal-voucher-item:active) {
    transform: scale(0.99);
  }

  .no-vouchers {
    text-align: center;
    padding: 24px 0;
    color: #94a3b8;
    font-size: 14px;
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
