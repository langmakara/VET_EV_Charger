<script setup lang="ts">
  import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonText,
    onIonViewWillEnter
  } from '@ionic/vue'
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import Icon from '~/components/Icon/icon.vue'
  import History from '~/components/Membership/History.vue'
  import AppModal from '~/components/Modal/AppModal.vue'
  import {
    useMembershipChargeHistoryQuery,
    useMembershipInfoQuery
  } from '~/composables/queries/useMembership'
  import type { ChargeHistoryData, ChargeHistoryParams, MembershipInfoData } from '~/api/types'

  const route = useRoute()
  const router = useRouter()

  const showSheet = ref(false)
  const headerIsActive = ref(false)
  const activeTab = ref<'all' | 'earned' | 'spend'>('all')

  function checkTab() {
    const tab = (router?.currentRoute?.value?.query?.tab ?? route?.query?.tab) as string | undefined
    headerIsActive.value = tab === 'history'
  }

  const { data: membershipInfo, isLoading, isError, error } = useMembershipInfoQuery()

  const membership = computed<MembershipInfoData | null>(() => {
    const res: any = membershipInfo.value
    return res?.data ?? res?.body?.data ?? null
  })

  const filter = computed<ChargeHistoryParams>(() => ({
    rowsPerPage: 20,
    type: activeTab.value === 'earned' ? 1 : activeTab.value === 'spend' ? 2 : undefined
  }))

  const {
    data: point,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMembershipChargeHistoryQuery(filter, {
    enabled: headerIsActive
  })

  const chargeHistory = computed<ChargeHistoryData[]>(() => {
    if (!point.value?.pages) return []
    return point.value.pages.flatMap((page: any) => {
      const res = page?.data ?? page?.body?.data
      return Array.isArray(res) ? res : []
    })
  })

  const filteredHistory = computed(() => {
    if (activeTab.value === 'all') return chargeHistory.value
    return chargeHistory.value
      .map((group) => {
        const txs = (group.transactions || []).filter((tx) => {
          const isEarn = tx.typeName?.toLowerCase() === 'earn' || tx.type === 1
          return activeTab.value === 'earned' ? isEarn : !isEarn
        })
        return {
          ...group,
          transactions: txs
        }
      })
      .filter((group) => group.transactions.length > 0)
  })

  const setTab = (tab: 'all' | 'earned' | 'spend') => {
    activeTab.value = tab
  }

  // Sentinel and scroll handling for custom overflow-y container
  const sentinelEl = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  const handleScroll = async (event: Event) => {
    const el = event.target as HTMLElement
    if (!el || !hasNextPage?.value || isFetchingNextPage.value) return

    const threshold = 160
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
    if (isNearBottom) {
      await fetchNextPage()
    }
  }

  const setupObserver = () => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    if (observer) {
      observer.disconnect()
    }
    if (!sentinelEl.value) return

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasNextPage.value && !isFetchingNextPage.value) {
          fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: '120px',
        threshold: 0.1
      }
    )
    observer.observe(sentinelEl.value)
  }

  watch(sentinelEl, () => {
    setupObserver()
  })

  onMounted(() => {
    checkTab()
    setupObserver()
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  onIonViewWillEnter(() => {
    checkTab()
  })

  watch(
    () => [route?.fullPath, route?.query?.tab],
    () => {
      checkTab()
    },
    { immediate: true }
  )

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progressOffset = computed(() => {
    const current = Number(membership.value?.currentLevelRequirePoint)
    const max = Number(membership.value?.requirePoint)

    if (!max || max <= 0) return circumference

    const progressRatio = Math.min(Math.max(current / max, 0), 1)
    return circumference - circumference * progressRatio
  })

  const headerBenefit = () => {
    navigateTo('/membership/membershipBenefit')
  }
  const headerHistory = () => {
    headerIsActive.value = true
    router.push({ query: { ...route.query, tab: 'history' } })
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
                  <span class="current-points">{{ membership?.currentLevelRequirePoint }}</span>
                  <div class="divider"></div>
                  <span class="max-points">{{ membership?.requirePoint }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <div class="tier-header-row">
                <h1 class="tier-name">{{ membership?.membershipLevelName }}</h1>
                <span class="user-id">ID: {{ membership?.cardId }}</span>
              </div>

              <div class="points-info-row">
                <span class="current-points-label"
                  >Current Points: {{ membership?.currentPoint }}</span
                >
                <span class="expiry-label">
                  (expires in <span class="days-left">{{ membership?.expiringInDays }} days</span>)
                </span>
              </div>

              <div class="help-link-row" @click="showSheet = true">
                <Icon name="info-circle" size="16px" color="#df5e0e" class="info-icon" />
                <span class="help-link-text">How to earn or use point</span>
              </div>
            </div>
          </div>
        </div>

        <div class="content-container" :class="{ 'history-active': headerIsActive }">
          <div v-if="!headerIsActive" class="membership-benefit" @click="headerBenefit">
            <h2 class="title"><Icon name="user-plus" size="18px" />Membership Benefit</h2>
            <div class="view-all" role="button" tabindex="0">
              <Icon name="chevron-right" class="chevron-icon" size="20px" />
            </div>
          </div>
          <div v-if="!headerIsActive" class="membership-benefit" @click="headerHistory">
            <h2 class="title"><Icon name="history-check" size="18px" />History</h2>
            <div class="view-all" role="button" tabindex="0">
              <Icon name="chevron-right" class="chevron-icon" size="20px" />
            </div>
          </div>
          <!-- History View -->
          <div v-if="headerIsActive" class="history-view">
            <!-- Tabs: All | Earned | Spend -->
            <div class="history-header-tabs">
              <ion-grid>
                <ion-row class="tab-row">
                  <ion-col>
                    <ion-button
                      class="tab-btn"
                      :class="{ active: activeTab === 'all' }"
                      expand="block"
                      fill="solid"
                      @click="setTab('all')"
                      >All</ion-button
                    >
                  </ion-col>
                  <ion-col>
                    <ion-button
                      class="tab-btn"
                      :class="{ active: activeTab === 'earned' }"
                      expand="block"
                      fill="solid"
                      @click="setTab('earned')"
                      >Earned</ion-button
                    >
                  </ion-col>
                  <ion-col>
                    <ion-button
                      class="tab-btn"
                      :class="{ active: activeTab === 'spend' }"
                      expand="block"
                      fill="solid"
                      @click="setTab('spend')"
                      >Spend</ion-button
                    >
                  </ion-col>
                </ion-row>
              </ion-grid>
            </div>

            <!-- History List Scroll with scroll listener -->
            <div class="history-list-scroll" @scroll.passive="handleScroll">
              <!-- Loading -->
              <div v-if="isHistoryLoading && filteredHistory.length === 0" class="loading-state">
                <ion-spinner name="crescent" color="primary" />
              </div>

              <!-- Error -->
              <div v-else-if="isHistoryError && filteredHistory.length === 0" class="empty-state">
                <p>{{ historyError?.message || 'Failed to load history' }}</p>
              </div>

              <!-- History Cards List -->
              <template v-else-if="filteredHistory.length > 0">
                <History v-for="item in filteredHistory" :key="item.date" :item="item" />

                <!-- Sentinel for Infinite Scroll (IntersectionObserver + Scroll handler) -->
                <div ref="sentinelEl" class="infinite-sentinel">
                  <div v-if="isFetchingNextPage" class="loading-more">
                    <ion-spinner name="crescent" color="primary" />
                    <span>Loading more...</span>
                  </div>
                </div>
              </template>

              <!-- Empty state -->
              <ion-text v-else class="empty-state">
                <p>No history found.</p>
              </ion-text>
            </div>
          </div>
        </div>
      </div>
      <!-- Bottom sheet -->
      <AppModal
        v-model="showSheet"
        title="How to earn & use points"
        :breakpoints="[0, 0.48, 0.75]"
        :initial-breakpoint="0.48"
      >
        <div class="points-guide-card">
          <!-- Earn Points -->
          <div class="guide-item">
            <div class="guide-icon-wrapper">
              <Icon name="earn-points" size="22px" color="#df5e0e" />
            </div>
            <div class="guide-info">
              <h3 class="guide-title">Earn points</h3>
              <p class="guide-desc">
                Points are added to your balance base on how much you spent on your charging
                process.
              </p>
              <div class="guide-badge-wrapper">
                <span class="guide-rate-badge">100 kWh = 1 pt</span>
              </div>
            </div>
          </div>

          <div class="guide-divider"></div>

          <!-- Use Points -->
          <div class="guide-item">
            <div class="guide-icon-wrapper">
              <Icon name="use-points" size="22px" color="#df5e0e" />
            </div>
            <div class="guide-info">
              <h3 class="guide-title">Use points</h3>
              <p class="guide-desc">
                Redeem points for kWh for charging or benefits when available.
              </p>
            </div>
          </div>
        </div>
      </AppModal>
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
    background: linear-gradient(135deg, #faece1 0%, #f6ddcb 50%, #edd1bc 100%);
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
    padding: 24px 16px;
    position: relative;
    z-index: 1;
  }

  .crown-watermark {
    position: absolute;
    right: -25px;
    bottom: -25px;
    width: 175px;
    height: 175px;
    opacity: 0.22;
    z-index: 0;
    pointer-events: none;
  }

  .progress-section {
    flex-shrink: 0;
    margin-right: 14px;
  }

  .progress-wrapper {
    position: relative;
    width: 112px;
    height: 112px;
  }

  .circular-progress {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .track-circle {
    fill: #ffffff;
    stroke: #ffdcc4;
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
    width: 70px;
    height: 1.5px;
    background-color: #1a1d2e;
    margin: 4px 0;
  }

  .max-points {
    font-size: 15px;
    font-weight: 500;
    color: #5c6479;
    line-height: 1;
  }

  .details-section {
    flex: 1;
    min-width: 0;
  }

  .tier-header-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .tier-name {
    font-size: 30px;
    font-weight: 800;
    color: #1a1e28;
    margin: 0;
    line-height: 1.1;
  }

  .user-id {
    font-size: 13.5px;
    color: #6c7280;
    font-weight: 400;
    margin: 0;
  }

  .points-info-row {
    font-size: 13px;
    margin: 0 0 12px 0;
    line-height: 1.4;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .current-points-label {
    color: #df5e0e;
    font-weight: 600;
  }

  .expiry-label {
    color: #6c7280;
  }

  .days-left {
    color: #10b981;
    font-weight: 500;
  }

  .help-link-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #df5e0e;
    cursor: pointer;
    user-select: none;
    width: fit-content;
  }

  .info-icon {
    flex-shrink: 0;
  }

  .help-link-text {
    font-size: 13px;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;
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
    gap: 10px;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f232d;
  }

  /* Points Guide Card inside Modal */
  .points-guide-card {
    background-color: #f5f6f8;
    border-radius: 18px;
    padding: 20px 16px;
    margin: 4px 0 16px 0;
  }

  .guide-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .guide-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .guide-icon {
    width: 22px;
    height: 22px;
  }

  .guide-info {
    flex: 1;
    min-width: 0;
  }

  .guide-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1e28;
    margin: 0 0 6px 0;
    line-height: 1.2;
  }

  .guide-desc {
    font-size: 13.5px;
    color: #4b5563;
    line-height: 1.45;
    margin: 0;
  }

  .guide-badge-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .guide-rate-badge {
    background-color: #fde68a;
    color: #854d0e;
    font-size: 12.5px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 9999px;
    letter-spacing: -0.2px;
  }

  .guide-divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 18px 0;
  }

  /* History View Styles */
  .history-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    width: 100%;
    overflow: hidden;
  }

  .history-header-tabs {
    flex-shrink: 0;
    padding: 0;
  }

  .tab-row {
    padding-top: 10px;
    margin-bottom: 4px;
  }

  .history-list-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    padding: 0 10px 10px 10px;
  }

  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
  }

  .empty-state {
    display: block;
    text-align: center;
    color: #8c92a0;
    margin-top: 48px;
    font-size: 14px;
  }

  .infinite-sentinel {
    min-height: 24px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 0 20px;
  }

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #df5e0e;
    font-size: 13px;
    font-weight: 500;
  }
</style>

<style>
  ion-button.tab-btn {
    --border-radius: 12px;
    --box-shadow: none;
    --border-width: 0;
    margin: 0;
    height: 40px;
    font-size: 14px;
    font-weight: 400;
    text-transform: capitalize;
    --background: #e5e7eb;
    --color: #6c7280;
    --background-hover: #ffe4cc;
    --color-hover: #c44e05;
    --background-hover-opacity: 1;
  }

  ion-button.tab-btn.active {
    --background: #fff3e6;
    --color: #df5e0e;
    --background-hover: #ffe4cc;
    --color-hover: #c44e05;
    --background-hover-opacity: 1;
    font-weight: 600;
  }
</style>
