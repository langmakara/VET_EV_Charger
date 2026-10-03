<script setup lang="ts">
import { ref } from 'vue';
import AppCard from '~/components/Card/AppCard.vue';

// Reactive sample data matching the original coupon design
const discountRate = ref('5.0%');
const conditions = ref('5% off with any charge');
const voucherLabel = ref('Voucher Code');
const voucherExpiry = ref('Valid Till - 31 December 2024');
const isActive = ref(true);
</script>

<template>
  <!-- Using standard wrapper adjustments to fit AppCard custom structure safely -->
  <AppCard class="voucher-card-wrapper">
    <ion-grid class="voucher-grid">
      <ion-row class="voucher-row">
        
        <!-- Left Section (Orange Discount Badge Area) -->
        <ion-col class="voucher-header" size="4">
          <div class="badge-content">
            <ion-text class="discount-rate">{{ discountRate }}</ion-text>
            <ion-text class="discount-lbl">OFF</ion-text>
            <hr class="badge-divider" />
            <ion-text class="condition-txt">{{ conditions }}</ion-text>
          </div>
        </ion-col>
        
        <!-- Right Section (White Text Details Area) -->
        <ion-col class="voucher-body" size="8">
          <div class="details-content">
            <div class="top-meta">
              <ion-text class="title-text">{{ voucherLabel }}</ion-text>
              <span v-if="isActive" class="status-indicator">
                <span class="status-dot"></span>Active
              </span>
            </div>
            
            <ion-text class="highlight-rate">{{ discountRate }} OFF</ion-text>
            <ion-text class="expiry-text">{{ voucherExpiry }}</ion-text>
          </div>
        </ion-col>

      </ion-row>
    </ion-grid>
  </AppCard>
</template>

<style scoped>
/* Reset padding inside your wrapper to ensure the edges flush correctly */
.voucher-card-wrapper {
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.voucher-grid {
  padding: 0px;
}

.voucher-row {
  display: flex;
  align-items: stretch; /* Forces left and right columns to have identical height */
}

/* 
  Left Side styling 
  Replaces the invalid border-radius with modern radial gradient clipping masks 
*/
.voucher-header {
  background-color: #e66a15; /* Replaced blueviolet with the authentic ticket orange */
  padding: var(--ion-padding);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  /* Creates perfectly smooth inward circle cutouts on the top-right and bottom-right edges */
  mask-image: radial-gradient(circle at 100% 0px, transparent 8px, white 0),
              radial-gradient(circle at 100% 100%, transparent 8px, white 0);
  mask-composite: intersect;
  -webkit-mask-image: radial-gradient(circle at 100% 0px, transparent 8px, white 0),
                      radial-gradient(circle at 100% 100%, transparent 8px, white 0);
  -webkit-mask-composite: destination-in;
}

.badge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #ffffff;
}

.discount-rate {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
}

.discount-lbl {
  font-size: 12px;
  font-weight: 600;
}

.badge-divider {
  width: 80%;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  margin: 6px 0;
}

.condition-txt {
  font-size: 10px;
  line-height: 1.2;
  opacity: 0.9;
}

/* Right Side styling */
.voucher-body {
  padding: var(--ion-padding);
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.details-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

/* Green Active State Dot */
.status-indicator {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #2e7d32;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: #2e7d32;
  border-radius: 50%;
  margin-right: 4px;
}

.highlight-rate {
  font-size: 18px;
  font-weight: 700;
  color: #e66a15;
  margin: 4px 0;
}

.expiry-text {
  font-size: 12px;
  color: #888888;
}
</style>
