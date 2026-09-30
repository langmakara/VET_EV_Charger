<script setup lang="ts">
  import { IonPage, IonContent } from '@ionic/vue'
  import { computed } from 'vue'
  import IconButton from '../../components/Button/IconButton.vue'
  import Icon from '~/components/Icon/icon.vue'
  import history from './history.vue'

  const route = useRoute()
  const router = useRouter()

  const currentPoints = 190
  const maxPoints = 2500

  // Synchronized with route query ?tab=history so clicking back route closes history
  const headerIsActive = computed({
    get: () => route.query.tab === 'history',
    set: (val: boolean) => {
      if (val) {
        router.push({ query: { ...route.query, tab: 'history' } })
      } else if (route.query.tab === 'history') {
        router.back()
      }
    }
  })

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progressOffset = computed(() => {
    return circumference - (circumference * currentPoints) / maxPoints
  })

  const headerBenefit = () => {
    navigateTo('/membership/membershipBenefit')
  }
  const headerHistory = () => {
    headerIsActive.value = true
  }
</script>

<template>
  <ion-page class="no-padding">
    <ion-content :fullscreen="true" :scroll-y="false">
      <div class="membership-layout">
        <div class="membership-header">
          <div class="membership-card">
            <!-- Crown Watermark -->
            <svg class="crown-watermark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="55" r="45" fill="none" stroke="white" stroke-width="8" />
              <path
                d="M25 70 L30 35 L50 50 L70 35 L75 70 Z"
                fill="none"
                stroke="white"
                stroke-width="8"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </svg>

            <div class="progress-section">
              <div class="progress-wrapper">
                <svg viewBox="0 0 100 100" class="circular-progress">
                  <circle cx="50" cy="50" r="40" class="track-circle" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    class="progress-circle"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset"
                  />
                </svg>
                <div class="progress-text-container">
                  <span class="current-points">{{ currentPoints }}</span>
                  <div class="divider"></div>
                  <span class="max-points">{{ maxPoints }}</span>
                </div>
              </div>
            </div>
            <div class="details-section">
              <h1 class="tier-name">Silver</h1>
              <p class="user-id">ID: 010 993 906</p>
              <p class="expiry-text">
                20 point = 20 kWh will expires in <span class="days-left">20 days</span>
              </p>
            </div>
          </div>
        </div>

        <div class="content-container" :class="{ 'history-active': headerIsActive }">
          <div v-if="!headerIsActive" class="membership-benefit" @click="headerBenefit">
            <h2 class="title"><Icon name="user-plus" size="18px" />Membership Benefit</h2>
            <div class="view-all" @click="$emit('view-all')" role="button" tabindex="0">
              <Icon name="chevron-right" class="chevron-icon" size="20px" />
            </div>
          </div>
          <div v-if="!headerIsActive" class="membership-benefit" @click="headerHistory">
            <h2 class="title"><Icon name="history-check" size="18px" />History</h2>
            <div class="view-all" @click="$emit('view-all')" role="button" tabindex="0">
              <Icon name="chevron-right" class="chevron-icon" size="20px" />
            </div>
          </div>
          <history v-if="headerIsActive" />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .no-padding,
  .no-padding ion-content,
  ion-content {
    --padding-top: 0 !important;
    --padding-bottom: 0 !important;
    --padding-start: 0 !important;
    --padding-end: 0 !important;
    --inner-padding-top: 0 !important;
    --inner-padding-bottom: 0 !important;
    --inner-padding-start: 0 !important;
    --inner-padding-end: 0 !important;
    padding: 0 !important;
  }

  .membership-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .content-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: var(--ion-padding);
  }

  .content-container.history-active {
    overflow: hidden;
    padding: 0;
  }

  .membership-header {
    flex-shrink: 0;
    background: linear-gradient(135deg, #fff3e6 0%, #e3cbb8 100%);
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
    overflow: hidden;
    position: relative;
    box-shadow: none;
  }

  .transparent-toolbar {
    --background: transparent;
    --border-width: 0;
    --box-shadow: none;
    --min-height: 44px;
  }

  .membership-card {
    display: flex;
    align-items: center;
    padding: 70px 10px 30px;
    position: relative;
    z-index: 1;
  }

  .crown-watermark {
    position: absolute;
    right: -30px;
    bottom: -20px;
    width: 180px;
    height: 180px;
    opacity: 0.15;
    z-index: -1;
  }

  .progress-section {
    flex-shrink: 0;
    margin-right: 10px;
  }

  .progress-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .circular-progress {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .track-circle {
    fill: white;
    stroke: #f8d3b3;
    stroke-width: 10;
  }

  .progress-circle {
    fill: none;
    stroke: #df5e0e;
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
  }

  .progress-text-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .current-points {
    font-size: 22px;
    font-weight: 800;
    color: #df5e0e;
    line-height: 1;
    margin-top: 2px;
  }

  .divider {
    width: 35px;
    height: 1.5px;
    background-color: #1f232d;
    margin: 4px 0;
  }

  .max-points {
    font-size: 15px;
    color: #6c7280;
    line-height: 1;
  }

  .details-section {
    flex: 1;
  }

  .tier-name {
    font-size: 26px;
    font-weight: 900;
    color: #1f232d;
    margin: 0 0 6px 0;
    line-height: 1;
  }

  .user-id {
    font-size: 11px;
    color: #8c92a0;
    margin: 0 0 6px 0;
  }

  .expiry-text {
    font-size: 11px;
    color: #8c92a0;
    margin: 0;
    line-height: 1.4;
  }

  .days-left {
    color: #00a651;
    font-size: 11px;
  }

  .membership-benefit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 16px 10px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .title {
    display: flex;
    align-items: center;
    gap: 10px; /* Adds space between icon and text */
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f232d;
  }
</style>
