<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import {
    IonPage,
    IonContent,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonActionSheet,
    IonToast
  } from '@ionic/vue'
  import { chevronForward, chevronDown } from 'ionicons/icons'
  import { sendTitleToFlutter } from '~/composables/useNativeBridge'
  import AccountModal, { type AccountItem } from './accountModal.vue'
  import Icon from '~/components/Icon/icon.vue'

  // Set mini-app title for ABA Mini App wrapper
  onMounted(() => {
    sendTitleToFlutter('Charging Information')
  })

  // Mode: 'kwh' or 'khr'
  const selectedMode = ref<'kwh' | 'khr'>('kwh')

  // Presets
  const kwhPresets = ['20 kWh', '40 kWh', '60 kWh', '80 kWh', '100 kWh', 'Full Charge']
  const khrPresets = [
    '20,000 KHR',
    '40,000 KHR',
    '60,000 KHR',
    '80,000 KHR',
    '100,000 KHR',
    'Full Charge'
  ]

  const selectedPreset = ref('20 kWh')
  const inputAmount = ref<string>('20')

  // Switch mode (kWh vs KHR Amount)
  const setMode = (mode: 'kwh' | 'khr') => {
    selectedMode.value = mode
    if (mode === 'kwh') {
      selectedPreset.value = '20 kWh'
      inputAmount.value = '20'
    } else {
      selectedPreset.value = '48,000 KHR'
      inputAmount.value = '48000'
    }
  }

  // Select a preset button
  const selectPreset = (preset: string) => {
    selectedPreset.value = preset
    if (selectedMode.value === 'kwh') {
      if (preset === 'Full Charge') {
        inputAmount.value = '100'
      } else {
        inputAmount.value = preset.replace(' kWh', '')
      }
    } else {
      if (preset === 'Full Charge') {
        inputAmount.value = '240000'
      } else {
        inputAmount.value = preset.replace(/[^0-9]/g, '')
      }
    }
  }

  // Handle manual numeric input
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const rawValue = target.value.replace(/[^0-9]/g, '')
    inputAmount.value = rawValue

    // Check if matching preset
    if (selectedMode.value === 'kwh') {
      const match = kwhPresets.find((p) => p === `${rawValue} kWh`)
      selectedPreset.value = match || ''
    } else {
      const formatted = formatNumber(Number(rawValue))
      const match = khrPresets.find((p) => p === `${formatted} KHR`)
      selectedPreset.value = match || ''
    }
  }

  // Number formatting utility
  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString('en-US')
  }

  // Voucher state
  const voucherDiscountPercent = ref<number>(5)
  const isVoucherSheetOpen = ref(false)

  const voucherActionSheetButtons = [
    {
      text: '5% OFF - Welcome Voucher (Active)',
      data: { percent: 5 },
      handler: () => {
        voucherDiscountPercent.value = 5
      }
    },
    {
      text: '10% OFF - Green Mobility Voucher',
      data: { percent: 10 },
      handler: () => {
        voucherDiscountPercent.value = 10
      }
    },
    {
      text: 'Remove Voucher (0%)',
      role: 'destructive',
      data: { percent: 0 },
      handler: () => {
        voucherDiscountPercent.value = 0
      }
    },
    {
      text: 'Cancel',
      role: 'cancel'
    }
  ]

  // Point state
  const pointsApplied = ref<number>(0)
  const isPointSheetOpen = ref(false)

  const pointActionSheetButtons = [
    {
      text: 'Redeem 4,000 Points (-4,000 KHR)',
      handler: () => {
        pointsApplied.value = 4000
      }
    },
    {
      text: 'Redeem 2,000 Points (-2,000 KHR)',
      handler: () => {
        pointsApplied.value = 2000
      }
    },
    {
      text: 'Do not use points',
      role: 'destructive',
      handler: () => {
        pointsApplied.value = 0
      }
    },
    {
      text: 'Cancel',
      role: 'cancel'
    }
  ]

  // Accounts state matching the bottom sheet design
  const accounts = ref([
    {
      id: 'main',
      name: 'Main',
      number: '004 026 957',
      currency: 'USD',
      isDefault: true,
      color: '#00C0DE'
    },
    {
      id: 'food_and_drink',
      name: 'Food And Drink',
      number: '015 841 241',
      currency: 'KHR',
      isDefault: false,
      color: '#9353D3'
    }
  ])

  const selectedAccountId = ref('main')
  const currentAccount = computed(() => {
    return accounts.value.find((acc) => acc.id === selectedAccountId.value) || accounts.value[0]
  })
  const isAccountModalOpen = ref(false)

  const selectAccount = (account: (typeof accounts.value)[0]) => {
    selectedAccountId.value = account.id
    setTimeout(() => {
      isAccountModalOpen.value = false
    }, 180)
  }

  // Dynamic Financial Calculations
  const KHR_PER_KWH = 2400 // Standard Cambodia EV charging rate (2,400 KHR / kWh)

  const subTotal = computed(() => {
    const val = Number(inputAmount.value) || 0
    if (selectedMode.value === 'kwh') {
      return val * KHR_PER_KWH
    }
    return val
  })

  const discountAmount = computed(() => {
    // If exactly 20 kWh with 5% discount matching mock visual
    if (
      selectedMode.value === 'kwh' &&
      Number(inputAmount.value) === 20 &&
      voucherDiscountPercent.value === 5
    ) {
      return 4000 + pointsApplied.value
    }
    const voucherCut = subTotal.value * (voucherDiscountPercent.value / 100)
    return voucherCut + pointsApplied.value
  })

  const totalPrice = computed(() => {
    return Math.max(0, subTotal.value - discountAmount.value)
  })

  // Toast Feedback
  const showToast = ref(false)
  const toastMessage = ref('')

  // Payment Action
  const handlePay = () => {
    toastMessage.value = `Processing payment of ${formatNumber(totalPrice.value)} KHR...`
    showToast.value = true

    setTimeout(() => {
      navigateTo('/charging')
    }, 1200)
  }
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
            <span class="segment-label">kWh</span>
          </button>

          <button
            type="button"
            class="segment-pill"
            :class="{ 'is-active': selectedMode === 'khr' }"
            @click="setMode('khr')"
          >
            <span class="segment-text-bold">KHR</span>
            <span class="segment-text-light">Amount</span>
          </button>
        </div>

        <!-- 2. Section Heading -->
        <div class="section-title">Electrical input information</div>

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
              <span class="action-title">Apply Voucher</span>
            </div>

            <div class="action-right">
              <span class="action-badge-orange">
                {{ voucherDiscountPercent > 0 ? `${voucherDiscountPercent}% OFF` : 'None' }}
              </span>
              <ion-icon :icon="chevronForward" class="action-chevron"></ion-icon>
            </div>
          </div>

          <!-- Apply Point -->
          <div class="action-row" @click="isPointSheetOpen = true">
            <div class="action-left">
              <!-- Star Icon -->
              <Icon name="star" size="19px" class="action-icon" />
              <span class="action-title">Apply Point</span>
            </div>

            <div class="action-right">
              <span class="action-badge-orange">
                {{ pointsApplied > 0 ? `${formatNumber(pointsApplied)} points` : '0 points' }}
              </span>
              <ion-icon :icon="chevronForward" class="action-chevron"></ion-icon>
            </div>
          </div>
        </div>

        <!-- 5. Preferred Amount Input Box -->
        <div class="input-section">
          <label class="input-label" for="preferred-amount-input">
            Or enter your preferred amount
          </label>
          <div class="input-wrapper">
            <input
              id="preferred-amount-input"
              type="text"
              inputmode="numeric"
              :value="inputAmount"
              class="custom-amount-input"
              placeholder="0"
              @input="handleInput"
            />
            <span class="input-suffix">{{ selectedMode === 'kwh' ? 'kWh' : 'KHR' }}</span>
          </div>
        </div>

        <!-- 6. Price Summary Section -->
        <div class="summary-card">
          <div class="summary-line">
            <span class="summary-label">Sub Total</span>
            <span class="summary-value">KHR (៛) {{ formatNumber(subTotal) }}</span>
          </div>

          <div class="summary-line">
            <span class="summary-label">
              Discount {{ voucherDiscountPercent > 0 ? `(${voucherDiscountPercent}%)` : '' }}
            </span>
            <span class="summary-value discount-text">
              -KHR (៛) {{ formatNumber(discountAmount) }}
            </span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-line total-line">
            <span class="total-label">Total Price</span>
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
            You’ll only pay for the energy used. Any unused amount will be returned once charging
            stops.
          </p>
        </div>
      </div>
    </ion-content>

    <!-- Bottom Footer Section: Account Card + Pay Button -->
    <ion-footer class="ion-no-border charging-info-footer">
      <div class="footer-wrapper">
        <!-- Saving Account Selector Box -->
        <div class="account-card" @click="isAccountModalOpen = true">
          <div class="account-top-row">
            <span class="account-type-title">{{ currentAccount.name }}</span>
            <div class="account-dropdown-trigger">
              <span class="account-dropdown-text">Account</span>
              <ion-icon :icon="chevronDown" class="account-chevron-icon"></ion-icon>
            </div>
          </div>
          <div class="account-bottom-row">
            {{ currentAccount.number }} | {{ currentAccount.currency }}
          </div>
        </div>

        <!-- Orange Pay Button with ABA PAY Logo Badge -->
        <button type="button" class="pay-main-button" @click="handlePay">
          <!-- ABA PAY Badge -->
          <div class="aba-pay-badge">
            <div class="aba-top-row">
              <span class="aba-letters">ABA</span>
              <span class="aba-red-accent"></span>
            </div>
            <div class="aba-pay-sub">PAY</div>
          </div>

          <!-- Button Text -->
          <span class="pay-button-label"> Pay {{ formatNumber(totalPrice) }} KHR </span>
        </button>
      </div>
    </ion-footer>

    <!-- Dark Account Bottom Sheet Modal Component -->
    <AccountModal
      v-model:is-open="isAccountModalOpen"
      :selected-id="selectedAccountId"
      :accounts="accounts"
      @select="selectAccount"
    />

    <!-- Action Sheets for Interactive Options -->
    <!-- <ion-action-sheet
      :is-open="isVoucherSheetOpen"
      header="Select Voucher"
      :buttons="voucherActionSheetButtons"
      @didDismiss="isVoucherSheetOpen = false"
    ></ion-action-sheet> -->

    <!-- <ion-action-sheet
      :is-open="isPointSheetOpen"
      header="Redeem Points"
      :buttons="pointActionSheetButtons"
      @didDismiss="isPointSheetOpen = false"
    ></ion-action-sheet> -->

    <!-- Notification Toast -->
    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :duration="2000"
      position="top"
      color="dark"
      @didDismiss="showToast = false"
    ></ion-toast>
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
    box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.03);
    border-top: 1px solid #f1f4f8;
  }

  .footer-wrapper {
    margin: 0 auto;
    width: 100%;
  }

  /* Account Box */
  .account-card {
    background-color: #f1f4f7;
    border-radius: 10px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .account-card:active {
    background-color: #e8ecf1;
  }

  .account-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .account-type-title {
    color: #111827;
    font-size: 14px;
    font-weight: 700;
  }

  .account-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .account-dropdown-text {
    color: #1e3a8a;
    font-size: 13px;
    font-weight: 600;
  }

  .account-chevron-icon {
    font-size: 14px;
    color: #1e3a8a;
  }

  .account-bottom-row {
    color: #838e9e;
    font-size: 12px;
    font-weight: 400;
    margin-top: 1px;
  }

  /* Pay Button */
  .pay-main-button {
    width: 100%;
    height: 48px;
    border-radius: 10px;
    border: none;
    background-color: #de5d0a;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
    cursor: pointer;
    transition: all 0.18s ease-in-out;
    box-shadow: 0 3px 10px rgba(222, 93, 10, 0.28);
  }

  .pay-main-button:active {
    transform: scale(0.985);
    box-shadow: 0 2px 5px rgba(222, 93, 10, 0.2);
  }

  /* ABA PAY Logo Badge */
  .aba-pay-badge {
    background-color: #ffffff;
    border-radius: 4px;
    padding: 2px 6px;
    height: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
    box-sizing: border-box;
  }

  .aba-top-row {
    display: flex;
    align-items: flex-start;
    gap: 1.5px;
  }

  .aba-letters {
    color: #005a79;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 900;
    font-size: 10px;
    letter-spacing: -0.4px;
  }

  .aba-red-accent {
    width: 2.8px;
    height: 2.8px;
    background-color: #e1232e;
    border-radius: 0.5px;
    margin-top: 1px;
  }

  .aba-pay-sub {
    color: #707b8a;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 800;
    font-size: 7.5px;
    letter-spacing: 0.8px;
    margin-top: 1px;
  }

  .pay-button-label {
    color: #ffffff;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.2px;
  }
</style>
