<script setup lang="ts">
  import AppInputField from '~/components/Controls/AppInputField.vue'
  import { IonCol, IonGrid, IonRow } from '@ionic/vue'
  import IconButton from '~/components/Button/IconButton.vue';
  import VoucherCard from './voucherCard.vue';
  import evData from '~/data/ev_charger_data.json';
  
  const vouchers = evData.vouchers;
</script>

<template>
  <ion-page>
    <ion-content>
      <ion-grid columns="2" class="voucher-grid">
        <ion-row>
          <ion-col>
            <AppInputField label="Enter or scan voucher code" placeholder="Code" />
          </ion-col>
          <ion-col size="auto" class="btn-container">
            <IconButton buttonType="scan" size="lg" />
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
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.btn-container {
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
  padding-right: 0;
}

.vouchers-container {
  display: flex;
  flex-direction: column;
}
.voucher-grid {
  padding: 10px 0;
}
</style>
