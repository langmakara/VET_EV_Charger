<script setup lang="ts">
import { IonModal, IonContent } from '@ionic/vue';

export interface AccountItem {
  id: string;
  name: string;
  number: string;
  currency: string;
  isDefault?: boolean;
  color: string;
}

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
    selectedId?: string;
    accounts?: AccountItem[];
  }>(),
  {
    isOpen: false,
    selectedId: 'main',
    accounts: () => [
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
    ]
  }
);

const emit = defineEmits<{
  (e: 'didDismiss'): void;
  (e: 'close'): void;
  (e: 'select', account: AccountItem): void;
  (e: 'update:isOpen', value: boolean): void;
}>();

const handleSelect = (account: AccountItem) => {
  emit('select', account);
  setTimeout(() => {
    emit('update:isOpen', false);
    emit('close');
  }, 180);
};

const handleDismiss = () => {
  emit('didDismiss');
  emit('update:isOpen', false);
  emit('close');
};
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="0.38"
    :breakpoints="[0, 0.38]"
    :handle="false"
    class="account-dark-modal"
    @didDismiss="handleDismiss"
  >
    <ion-content class="modal-dark-content" :scroll-y="false">
      <div class="sheet-container">
        <!-- Drag Handle -->
        <div class="sheet-handle"></div>

        <!-- Sheet Title -->
        <div class="sheet-header-title">Paying with account:</div>

        <!-- Account Options List -->
        <div class="accounts-group">
          <div
            v-for="account in accounts"
            :key="account.id"
            class="account-selection-card"
            :class="{ 'is-active': selectedId === account.id }"
            @click="handleSelect(account)"
          >
            <!-- Left colored stripe -->
            <div
              class="account-left-stripe"
              :style="{ backgroundColor: account.color }"
            ></div>

            <!-- Center info -->
            <div class="account-card-main">
              <div class="account-name-text">{{ account.name }}</div>
              <div class="account-sub-row">
                <span class="account-digits-text">
                  {{ account.number }} | {{ account.currency }}
                </span>
                <span v-if="account.isDefault" class="default-badge">
                  Default
                </span>
              </div>
            </div>

            <!-- Right radio button -->
            <div class="account-radio-box">
              <div
                v-if="selectedId === account.id"
                class="radio-ring-active"
                :style="{ borderColor: account.color }"
              >
                <div
                  class="radio-dot-inner"
                  :style="{ backgroundColor: account.color }"
                ></div>
              </div>
              <div v-else class="radio-ring-inactive"></div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.modal-dark-content {
  --background: #17232d;
  --color: #ffffff;
  background: #17232d;
}

.sheet-container {
  background-color: #17232d;
  padding: 12px 16px 28px 16px;
  min-height: 100%;
  box-sizing: border-box;
}

.sheet-handle {
  width: 42px;
  height: 4px;
  background-color: #2a3946;
  border-radius: 2px;
  margin: 0 auto 18px auto;
}

.sheet-header-title {
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.2px;
  padding-left: 2px;
}

.accounts-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-selection-card {
  position: relative;
  background-color: #212f3b;
  border-radius: 14px;
  padding: 14px 18px 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.account-selection-card:active {
  background-color: #273746;
  transform: scale(0.99);
}

.account-left-stripe {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 7px;
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}

.account-card-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.account-name-text {
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.25;
}

.account-sub-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-digits-text {
  color: #8c9dae;
  font-size: 13.5px;
  font-weight: 400;
}

.default-badge {
  background-color: #00c0de;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.2;
}

.account-radio-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.radio-ring-active {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border-width: 2.2px;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.radio-dot-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.radio-ring-inactive {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #4a5c6e;
  background: transparent;
}
</style>

<style>
/* Global modal container overrides for the dark account sheet */
ion-modal.account-dark-modal {
  --background: #17232d;
  --border-radius: 20px 20px 0 0;
  --backdrop-opacity: 0.65;
}

ion-modal.account-dark-modal::part(content) {
  border-radius: 20px 20px 0 0;
  background: #17232d;
  overflow: hidden;
}
</style>
