<script setup lang="ts">
  import {
    IonPage,
    IonContent,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon
  } from '@ionic/vue'
  import ToastAlert from '~/components/Alert/ToastAlert.vue'
  import { chevronForward, chevronDown } from 'ionicons/icons'
  import VoucherModal from './voucherModal.vue'
  import PointModal from './pointModal.vue'
  import Icon from '~/components/Icon/icon.vue'
  import AppButton from '~/components/Button/AppButton.vue'
  import AppInputField from '~/components/Controls/AppInputField.vue'
  import { useChargingInforService } from '~/services/chargingInfor.service'

  const {
    // Mode & Presets
    selectedMode,
    setMode,
    kwhPresets,
    khrPresets,
    selectedPreset,
    selectPreset,
    inputAmount,
    handleInput,
    formatNumber,

    // Voucher
    voucherList,
    selectedVoucher,
    voucherDiscountPercent,
    isVoucherSheetOpen,
    voucherBadgeText,
    voucherLabelText,
    handleApplyVoucher,

    // Points
    pointsApplied,
    isPointSheetOpen,
    handleApplyPoints,

    // Accounts
    accounts,
    selectedAccountId,
    currentAccount,
    activeAccount,
    accountChecked,
    isLoadingAccount,
    PaymentTrigger,

    // Financial Calculations
    subTotal,
    discountAmount,
    totalPrice,

    // Promotion & Order APIs
    calculatePromotion,
    isCalculatingPromotion,
    createTempOrder,
    isSubmittingOrder,
    handlePay,

    // WebSocket
    socketData,
    socketStatus,
    sendSocketMessage,
    sendHello,

    // Toast
    showToast,
    toastMessage
  } = useChargingInforService()
</script>

<template>
  <ion-page>
    <ion-content class="charging-info-content" :fullscreen="true">
      <div class="content-wrapper">
        <!-- 1. Top Segment Tabs (kWh vs KHR Amount) -->
        <div class="segment-container">
          <button
            type="button"
            class="segment-pill"
            :class="{ 'is-active': selectedMode === 'kwh' }"
            @click="setMode('kwh')"
          >
            <!-- Front view car EV icon -->
            <Icon name="car-front" size="18px" class="car-icon" />
            <span class="segment-label">{{ $t('chargingInfor.kwh') }}</span>
          </button>

          <button
            type="button"
            class="segment-pill"
            :class="{ 'is-active': selectedMode === 'khr' }"
            @click="setMode('khr')"
          >
            <span class="segment-text-bold">{{ $t('chargingInfor.khr') }}</span>
            <span class="segment-text-light">{{ $t('chargingInfor.amount') }}</span>
          </button>
        </div>

        <!-- 2. Section Heading -->
        <div class="section-title">{{ $t('chargingInfor.electricalInputInfo') }}</div>

        <!-- 3. Grid of 6 Preset Choices (2 rows x 3 columns) -->
        <ion-grid class="preset-grid ion-no-padding">
          <ion-row class="grid-row">
            <ion-col
              v-for="item in selectedMode === 'kwh' ? kwhPresets : khrPresets"
              :key="item"
              size="4"
              class="grid-col"
            >
              <button
                type="button"
                class="preset-card"
                :class="{ 'is-selected': selectedPreset === item }"
                @click="selectPreset(item)"
              >
                {{ item }}
              </button>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- 4. Action Rows (Voucher & Points) -->
        <div class="action-list">
          <!-- Apply Voucher -->
          <div class="action-row" @click="isVoucherSheetOpen = true">
            <div class="action-left">
              <!-- Ticket / Voucher Icon -->
              <Icon name="voucher" size="19px" class="action-icon" />
              <span class="action-title">{{ $t('chargingInfor.applyVoucher') }}</span>
            </div>

            <div class="action-right">
              <span class="action-badge-orange">
                {{ voucherBadgeText }}
              </span>
              <ion-icon :icon="chevronForward" class="action-chevron"></ion-icon>
            </div>
          </div>

          <!-- Apply Point -->
          <div class="action-row" @click="isPointSheetOpen = true">
            <div class="action-left">
              <!-- Star Icon -->
              <Icon name="star" size="19px" class="action-icon" />
              <span class="action-title">{{ $t('chargingInfor.applyPoint') }}</span>
            </div>

            <div class="action-right">
              <span class="action-badge-orange">
                {{ pointsApplied > 0 ? `${formatNumber(pointsApplied)} points` : '0 points' }}
              </span>
              <ion-icon :icon="chevronForward" class="action-chevron"></ion-icon>
            </div>
          </div>
        </div>

        <!-- 5. Preferred Amount Input Box using Controls/AppInputField -->
        <div class="input-section">
          <AppInputField
            :model-value="inputAmount"
            :label="$t('chargingInfor.orEnterPreferredAmount')"
            placeholder="0"
            inputmode="numeric"
            :suffix="selectedMode === 'kwh' ? 'kWh' : 'KHR'"
            @update:model-value="handleInput"
          />
        </div>

        <!-- 6. Price Summary Section -->
        <div class="summary-card">
          <div class="summary-line">
            <span class="summary-label">{{ $t('chargingInfor.subTotal') }}</span>
            <span class="summary-value">KHR (៛) {{ formatNumber(subTotal) }}</span>
          </div>

          <div class="summary-line">
            <span class="summary-label"> {{ $t('chargingInfor.discount') }} {{ voucherLabelText }} </span>
            <span class="summary-value discount-text">
              -KHR (៛) {{ formatNumber(discountAmount) }}
            </span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-line total-line">
            <span class="total-label">{{ $t('chargingInfor.totalPrice') }}</span>
            <span class="total-value">KHR (៛) {{ formatNumber(totalPrice) }}</span>
          </div>
        </div>

        <!-- 7. Notice / Return Energy Info Box -->
        <div class="info-notice-box">
          <div class="info-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8A94A6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="notice-svg"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p class="notice-description">
            {{ $t('chargingInfor.unusedReturnNotice') }}
          </p>
        </div>
      </div>
    </ion-content>

    <!-- Bottom Footer Section: ABA Pay Header + Account Row + Pay Button -->
    <ion-footer class="ion-no-border charging-info-footer">
      <div class="footer-wrapper">

        <!-- ABA Pay Header Row -->
        <div class="aba-pay-header">
          <Icon name="aba-bank" class="aba-bank-icon" width="40px" height="30px" />
          <span class="aba-pay-brand-label">ABA Pay</span>
        </div>

        <!-- Account Selector Row -->
        <div class="account-card" @click="PaymentTrigger(false)">
          <div class="account-top-row">
            <span class="account-type-title">{{ currentAccount?.name ?? $t('chargingInfor.selectAccount') }}</span>
            <div class="account-dropdown-trigger">
              <span class="account-dropdown-text">{{ $t('chargingInfor.change') }}</span>
              <ion-icon :icon="chevronDown" class="account-chevron-icon"></ion-icon>
            </div>
          </div>
          <div class="account-bottom-row">
            <template v-if="isLoadingAccount">{{ $t('chargingInfor.loadingAccount') }}</template>
            <template v-else-if="activeAccount">{{ activeAccount.accountNumber }}<span class="account-currency"> | {{ activeAccount.currency ?? 'KHR' }}</span></template>
          </div>
        </div>

        <AppButton
          expand="block"
          fill="solid"
          type="button"
          :disabled="isSubmittingOrder"
          @click="PaymentTrigger(true)"
        >
          {{ isSubmittingOrder ? 'Processing...' : `${$t('chargingInfor.pay')} ${formatNumber(totalPrice)} KHR` }}
        </AppButton>
      </div>
    </ion-footer>

    <!-- Apply Voucher Centered Dialog Modal Component -->
    <VoucherModal
      v-model:is-open="isVoucherSheetOpen"
      :voucherlist="voucherList"
      :selected-voucher="selectedVoucher"
      :selected-id="selectedVoucher?.id ?? selectedVoucher?.voucherCode"
      :selected-percent="voucherDiscountPercent"
      @apply="handleApplyVoucher"
    />

    <!-- Apply Point Centered Dialog Modal Component -->
    <PointModal
      v-model:is-open="isPointSheetOpen"
      :selected-points="pointsApplied"
      :current-points="120"
      @apply="handleApplyPoints"
    />

    <!-- Notification Toast -->
    <ToastAlert
      v-model:isOpen="showToast"
      :message="toastMessage"
      type="info"
      position="top"
    />
  </ion-page>
</template>

<style scoped>
  /* Page Layout */
  .charging-info-content {
    --background: #ffffff;
  }

  .content-wrapper {
    margin: 0 auto;
  }

  /* 1. Top Segment Tabs */
  .segment-container {
    display: flex;
    background-color: #e5ebf2;
    border-radius: 25px;
    padding: 3px;
    width: 100%;
    height: 44px;
    box-sizing: border-box;
  }

  .segment-pill {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    background: transparent;
    border-radius: 22px;
    height: 100%;
    font-size: 14.5px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    padding: 0;
    margin: 0;
  }

  .segment-pill.is-active {
    background-color: #de5d0a;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(222, 93, 10, 0.28);
  }

  .car-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .segment-label {
    font-weight: 700;
    font-size: 15px;
  }

  .segment-text-bold {
    font-weight: 700;
    font-size: 15px;
    color: #556276;
  }

  .segment-pill.is-active .segment-text-bold {
    color: #ffffff;
  }

  .segment-text-light {
    font-weight: 500;
    font-size: 14.5px;
    margin-left: 4px;
    color: #78869b;
  }

  .segment-pill.is-active .segment-text-light {
    color: #ffffff;
  }

  /* 2. Section Heading */
  .section-title {
    color: #7c8899;
    font-size: 13.5px;
    font-weight: 500;
    margin-top: 14px;
    margin-bottom: 8px;
  }

  /* 3. Preset Options Grid */
  .preset-grid {
    width: 100%;
    margin-bottom: 4px;
  }

  .grid-row {
    margin: -3.5px;
  }

  .grid-col {
    padding: 3.5px;
  }

  .preset-card {
    width: 100%;
    height: 46px;
    border-radius: 10px;
    border: none;
    background-color: #ecf1f8;
    color: #2b308f;
    font-size: 14.5px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.18s ease-in-out;
    padding: 0 4px;
    text-align: center;
    letter-spacing: -0.2px;
  }

  .preset-card:active {
    transform: scale(0.97);
  }

  .preset-card.is-selected {
    background-color: #de5d0a;
    color: #ffffff;
    box-shadow: 0 3px 8px rgba(222, 93, 10, 0.25);
  }

  /* 4. Action List (Voucher & Points) */
  .action-list {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
  }

  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 2px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.15s ease;
  }

  .action-row:active {
    background-color: #f8fafc;
  }

  .action-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .action-icon {
    width: 19px;
    height: 19px;
    color: #1f2937;
    flex-shrink: 0;
  }

  .action-title {
    color: #1f2937;
    font-size: 14.5px;
    font-weight: 500;
  }

  .action-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-badge-orange {
    color: #de5d0a;
    font-size: 14.5px;
    font-weight: 700;
  }

  .action-chevron {
    font-size: 16px;
    color: #1f2937;
  }

  /* 5. Preferred Amount Input */
  .input-section {
    margin-top: 8px;
  }

  .input-label {
    display: block;
    color: #7c8899;
    font-size: 13.5px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1.5px solid #d0d7e2;
    border-radius: 9px;
    background-color: #ffffff;
    height: 44px;
    padding: 0 12px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .input-wrapper:focus-within {
    border-color: #de5d0a;
    box-shadow: 0 0 0 3px rgba(222, 93, 10, 0.12);
  }

  .custom-amount-input {
    border: none;
    outline: none;
    font-size: 15.5px;
    font-weight: 500;
    color: #111827;
    width: 100%;
    background: transparent;
    padding: 0;
  }

  .input-suffix {
    color: #1f2937;
    font-size: 14.5px;
    font-weight: 500;
    margin-left: 8px;
  }

  /* 6. Summary Breakdown */
  .summary-card {
    margin-top: 14px;
  }

  .summary-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 7px;
  }

  .summary-label {
    color: #64748b;
    font-size: 14.5px;
    font-weight: 500;
  }

  .summary-value {
    color: #1e293b;
    font-size: 14.5px;
    font-weight: 700;
  }

  .discount-text {
    color: #1e293b;
  }

  .summary-divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 9px 0 10px 0;
  }

  .total-line {
    margin-bottom: 0;
  }

  .total-label {
    color: #1e293b;
    font-size: 15.5px;
    font-weight: 700;
  }

  .total-value {
    color: #1e293b;
    font-size: 15.5px;
    font-weight: 800;
  }

  /* 7. Notice Information Box */
  .info-notice-box {
    background-color: #f7f9fa;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 12px;
    margin-bottom: 16px;
  }

  .info-icon-wrapper {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .notice-svg {
    width: 17px;
    height: 17px;
    display: block;
  }

  .notice-description {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.45;
    font-weight: 400;
  }

  /* 8. Bottom Footer */
  .charging-info-footer {
    --background: #ffffff;
    background: #ffffff;
    box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.06);
    border-top: 1px solid #f1f4f8;
  }

  .footer-wrapper {
    margin: 0 auto;
    width: 100%;
    padding: 0;
  }

  /* ABA Pay Header */
  .aba-pay-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .aba-pay-brand-label {
    color: #111827;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.2px;
  }

  /* Account Selector Card */
  .account-card {
    background-color: transparent;
    padding: 0 0 8px;
    cursor: pointer;
  }

  .account-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }

  .account-type-title {
    color: #111827;
    font-size: 15px;
    font-weight: 700;
  }

  .account-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .account-dropdown-text {
    color: #1e3a8a;
    font-size: 14px;
    font-weight: 600;
  }

  .account-chevron-icon {
    font-size: 15px;
    color: #1e3a8a;
  }

  .account-bottom-row {
    color: #838e9e;
    font-size: 13px;
    font-weight: 400;
  }

  .account-currency {
    color: #838e9e;
  }

  .aba-bank-icon {
    border-radius: 5px;
  }
</style>
