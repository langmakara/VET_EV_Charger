<script setup lang="ts">
import AppCard from '~/components/Card/AppCard.vue';
import type { Voucher } from '~/types/ev-charger';

defineProps<Voucher>();
</script>

<template>
  <AppCard class="voucher-card">
    <ion-grid class="voucher-card">
      <ion-row>
        <ion-col class="voucher-header" size="4">
          <div class="badge-content">
            <ion-text class="discount-rate">{{ discountRate }}</ion-text>
            <ion-text class="discount-lbl">OFF</ion-text>
            <hr class="badge-divider" />
            <ion-text class="condition-txt">{{ conditions }}</ion-text>
          </div>
        </ion-col>

        <ion-col class="voucher-body" size="8">
          <div class="details-content">
            <div class="top-meta">
              <ion-text class="title-text">{{ voucherLabel }}</ion-text>
              <span class="status-indicator" :class="isActive ? 'is-active' : 'is-inactive'">
                <span class="status-dot"></span>{{ isActive ? 'Active' : 'Inactive' }}
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
.voucher-card {
  padding: 0px;
  box-shadow: none;
}

/* ---------- Left (orange) side ---------- */
.voucher-header {
  background-color: #e66a15;
  padding: var(--ion-padding);
  /* display: flex; */
  align-items: center;
  justify-content: center;
  position: relative;

  /* Inward circle cutouts on the top-right and bottom-right edges */
  mask-image: radial-gradient(circle at 100% 0px, transparent 8px, white 0),
              radial-gradient(circle at 100% 100%, transparent 8px, white 0);
  mask-composite: intersect;
  -webkit-mask-image: radial-gradient(circle at 100% 0px, transparent 8px, white 0),
                      radial-gradient(circle at 100% 100%, transparent 8px, white 0);
  -webkit-mask-composite: destination-in;
}

/* ---------- Right (details) side ---------- */
.voucher-body {
  background-color: #f7f4f3;
  padding: var(--ion-padding);
  display: flex;
  align-items: stretch;          /* details-content fills the full height */
  justify-content: flex-start;
  position: relative;
  min-height: 110px;             /* gives spare height to push the expiry into */

  /* Inward circle cutouts on the top-left and bottom-left edges */
  mask-image: radial-gradient(circle at 0% 0px, transparent 8px, white 0),
              radial-gradient(circle at 0% 100%, transparent 8px, white 0);
  mask-composite: intersect;
  -webkit-mask-image: radial-gradient(circle at 0% 0px, transparent 8px, white 0),
                      radial-gradient(circle at 0% 100%, transparent 8px, white 0);
  -webkit-mask-composite: destination-in;
}

.details-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  /* no justify-content here: margin-top: auto on the expiry handles the bottom */
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

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 14px;
  font-weight: 500;
}

.status-indicator.is-active {
  color: #2e7d32;
}

.status-indicator.is-inactive {
  color: #636363;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.status-indicator.is-active .status-dot {
  background-color: #2e7d32;
}

.status-indicator.is-inactive .status-dot {
  background-color: #636363;
}

.highlight-rate {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #e66a15;
  margin: 8px 0 8px;
  width: 100%;
}

.expiry-text {
  display: flex;
  justify-content: flex-start;   /* text on the left; use flex-end for right */
  margin-top: auto;              /* pins expiry to the bottom of voucher-body */
  font-size: 14px;
  color: #888888;
}

/* ---------- Left badge content ---------- */
.badge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #ffffff;
}

.badge-divider {
  width: 100%;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  margin: 6px 0;
}

.discount-rate {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  padding-left: 5px;
}

.discount-lbl {
  font-size: 14px;
  font-weight: 600;
}

.condition-txt {
  font-size: 14px;
  line-height: 1.2;
  opacity: 0.9;
}
</style>