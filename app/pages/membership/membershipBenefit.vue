<script setup lang="ts">
  import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonText,
    IonCardHeader,
    IonCardContent
  } from '@ionic/vue'
  import AppCard from '~/components/Card/AppCard.vue'
  import evData from '~/data/ev_charger_data.json'

  const benefits = evData.membershipBenefits || []
</script>

<template>
  <ion-page mode="ios">
    <ion-content :fullscreen="true" class="page-content">
      <div v-for="benefit in benefits" :key="benefit.id" class="benefit-header">
        <div v-if="benefit.isCurrentTier" class="ribbon-wrapper">
          <div class="ribbon">You are here</div>
        </div>
        <AppCard bgColor="#F3F3F3" class="benefit-card">
          <ion-card-header>
            <ion-text>
              <h4 class="benefit-name">{{ benefit.level }}</h4>
            </ion-text>
          </ion-card-header>
          <ion-card-content class="benefit-content">
            <ul class="perk-list">
              <li v-for="(perk, index) in benefit.perks" :key="index">
                <span>{{ perk.text }}</span>
                <ul v-if="perk.subItems" class="sub-perk-list">
                  <li v-for="(subItem, subIndex) in perk.subItems" :key="subIndex">
                    {{ subItem }}
                  </li>
                </ul>
              </li>
            </ul>
          </ion-card-content>
        </AppCard>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .page-content {
    --padding-top: 20px;
    --padding-bottom: 20px;
    --padding-start: 20px;
    --padding-end: 20px;
  }
  ion-card-header {
    padding: 16px 16px 8px 16px;
  }

  .benefit-name {
    color: #df5e0e;
    font-weight: 700;
    font-size: 20px !important;
    margin: 0;
  }

  .benefit-header {
    position: relative;
    margin-bottom: 24px;
  }

  .benefit-card {
    margin: 0;
    padding: 0;
  }

  .benefit-content {
    padding: 0 16px 16px 16px;
    color: #6c7280;
    font-size: 15px;
    line-height: 1.5;
  }

  .perk-list {
    padding-left: 20px;
    margin: 0;
  }

  .perk-list > li {
    margin-bottom: 8px;
  }

  .sub-perk-list {
    padding-left: 20px;
    margin-top: 4px;
  }

  .sub-perk-list > li {
    margin-bottom: 4px;
  }

  /* Ribbon styles */
  .ribbon-wrapper {
    position: absolute;
    top: -12px;
    right: -10px;
    width: 140px;
    height: 140px;
    z-index: 10;
    pointer-events: none;
    overflow: visible;
  }

  .ribbon-wrapper::before,
  .ribbon-wrapper::after {
    content: '';
    position: absolute;
    z-index: -1;
  }

  /* Top left fold */
  .ribbon-wrapper::before {
    top: 0;
    left: 29px;
    border-left: 15px solid transparent;
    border-bottom: 12px solid #a8460a;
  }

  /* Bottom right fold */
  .ribbon-wrapper::after {
    bottom: 20px;
    right: -6px;
    border-top: 21px solid #a8460a;
    border-right: 15px solid transparent;
  }

  .ribbon {
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    text-align: center;
    transform: rotate(45deg);
    position: absolute;
    padding: 5px 0;
    right: -30px;
    top: 35px;
    width: 145px;
    background-color: #df5e0e;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    border-radius: 24px 24px 0 0;
  }
</style>
