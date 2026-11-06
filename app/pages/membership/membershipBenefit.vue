<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import {
    IonPage,
    IonContent,
    IonSpinner,
    IonText,
    IonCardHeader,
    IonCardContent
  } from '@ionic/vue'
  import type { MembershipData } from '~/api/types'
  import AppCard from '~/components/Card/AppCard.vue'
  import { useMembershipQuery } from '~/composables/queries/useMembership'
  import { parsePerks } from '~/utils/formatters'

  const { data: benefits, isLoading, isError, error } = useMembershipQuery()

  const benefitsList = computed<MembershipData[]>(() => {
    const raw: any = benefits.value?.data ?? benefits.value?.body?.data
    const list: MembershipData[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.list)
        ? raw.list
        : []

    return list.map((item) => ({
      ...item,
      isCurrentTier: Boolean(item.isYouAreHere),
      perks:
        Array.isArray(item.perks) && item.perks.length > 0
          ? item.perks
          : parsePerks(item.description)
    }))
  })
</script>

<template>
  <ion-page mode="ios">
    <ion-content :fullscreen="true" class="page-content">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-spinner name="crescent" />
      </div>

      <!-- Error state -->
      <div v-else-if="isError" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-text color="danger">{{
          error?.message || 'Failed to load membership benefits'
        }}</ion-text>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="benefitsList.length === 0"
        class="ion-text-center ion-padding"
        style="margin-top: 40px"
      >
        <ion-text color="medium">No membership benefits available</ion-text>
      </div>

      <!-- Membership tiers list -->
      <div v-else v-for="tier in benefitsList" :key="tier.id" class="benefit-header">
        <div v-if="tier.isYouAreHere" class="ribbon-wrapper">
          <div class="ribbon">You are here</div>
        </div>
        <AppCard bgColor="#F3F3F3" class="benefit-card">
          <ion-card-header>
            <ion-text>
              <h4 class="benefit-name">{{ tier.name }}</h4>
            </ion-text>
          </ion-card-header>
          <ion-card-content class="benefit-content">
            <ul class="perk-list">
              <li v-for="(perk, index) in tier.perks" :key="index">
                <span>{{ perk.description }}</span>
                <ul v-if="perk.subItems && perk.subItems.length" class="sub-perk-list">
                  <li v-for="(subDesc, subIndex) in perk.subItems" :key="subIndex">
                    {{ subDesc }}
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
    color: var(--ion-color-primary);
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
    border-bottom: 12px solid var(--ion-color-primary);
  }

  /* Bottom right fold */
  .ribbon-wrapper::after {
    bottom: 20px;
    right: -6px;
    border-top: 21px solid var(--ion-color-primary);
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
    background-color: var(--ion-color-primary);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    border-radius: 24px 24px 0 0;
  }
</style>
