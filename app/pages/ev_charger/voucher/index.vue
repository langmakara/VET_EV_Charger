<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonGrid, IonRow, IonCol } from '@ionic/vue';
import AppInputField from '~/components/Controls/AppInputField.vue';
import IconButton from '~/components/Button/IconButton.vue';
import VoucherCard from './voucherCard.vue';
import AlertComponent from '~/components/Modal/AlertComponent.vue';
import ToastAlert from '~/components/Alert/ToastAlert.vue';
import evData from '~/data/ev_charger_data.json';
import type { Voucher } from '~/types/ev-charger';

const vouchers = evData.vouchers;
const voucherInputCode = ref('');

const isAlertOpen = ref(false);
const isToastOpen = ref(false);
const selectedVoucher = ref<Voucher | null>(null);

const handleCardClick = (voucher: Voucher) => {
  selectedVoucher.value = voucher;
  isAlertOpen.value = true;
};

const handleAlertCancel = () => {
  isAlertOpen.value = false;
};

const handleAlertConfirm = () => {
  isAlertOpen.value = false;
  isToastOpen.value = true;
};

const handlescanVouchercode = () => {
  navigateTo('/ev_charger/voucher/camera')
}
</script>

<template>
  <ion-page>
    <ion-content>
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

      <div class="vouchers-container">
        <VoucherCard 
          v-for="voucher in vouchers" 
          :key="voucher.id"
          :discountRate="voucher.discountRate"
          :conditions="voucher.conditions"
          :voucherLabel="voucher.voucherLabel"
          :voucherExpiry="voucher.voucherExpiry"
          :voucherDescription="voucher.voucherDescription"
          :isActive="voucher.isActive"
          @click="handleCardClick(voucher)"
        />
      </div>

      <!-- Alert Component for Voucher Confirmation -->
      <AlertComponent
        :isOpen="isAlertOpen"
        type="voucher"
        @cancel="handleAlertCancel"
        @confirm="handleAlertConfirm"
        @didDismiss="isAlertOpen = false"
      />

      <!-- Success Notification Alert Component -->
      <ToastAlert
        v-model:isOpen="isToastOpen"
        type="success"
        title="Success"
        message="Voucher added successfully"
        :highlightText="selectedVoucher?.voucherLabel || 'Voucher Code'"
      />
    </ion-content>
  </ion-page>
</template>

<style scoped>
.btn-container {
  display: flex;
  align-items: flex-end;
  padding-bottom: 5px;
  padding-right: 5px;
}

.vouchers-container {
  display: flex;
  flex-direction: column;
}
.voucher-grid {
  padding: 10px 0;
}
</style>

