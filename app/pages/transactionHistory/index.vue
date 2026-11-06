<script setup lang="ts">
  import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonSpinner,
    IonText
  } from '@ionic/vue'
  import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  import History from '~/components/Membership/History.vue'
  import TransactionModal from '~/components/Modal/TransactionModal.vue'
  import { useTransactionsHistoryQuery } from '~/composables/queries/useSaleOrder'
  import type { ChargeHistoryParams, TransactionHistoryData } from '~/api/types'

  type TabType = 'all' | 'earned' | 'spend'
  const activeTab = ref<TabType>('all')

  const filter = computed<ChargeHistoryParams>(() => ({
    rowsPerPage: 20,
    type: activeTab.value === 'earned' ? 1 : activeTab.value === 'spend' ? 2 : undefined
  }))

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTransactionsHistoryQuery(filter)

  // Transaction Detail Modal
  const isDetailModalOpen = ref(false)
  const selectedTransactionId = ref<string>('')
  const selectedTransaction = ref<any | null>(null)

  const handleItemClick = (tx: any) => {
    selectedTransaction.value = tx
    const id = tx?.transactionId ?? tx?.code ?? (tx?.id != null ? String(tx.id) : '')
    if (id) {
      selectedTransactionId.value = String(id)
    }
    isDetailModalOpen.value = true
  }

  const transactionHistory = computed<TransactionHistoryData[]>(() => {
    if (!data.value?.pages) return []
    const rawGroups: TransactionHistoryData[] = data.value.pages.flatMap((page: any) => {
      const res = page?.data ?? page?.body?.data
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.groups)) return res.groups
      if (Array.isArray(res?.list)) return res.list
      if (Array.isArray(page?.groups)) return page.groups
      return []
    })

    // Merge groups by date in case pagination splits transactions across the same day
    const dateMap = new Map<string, TransactionHistoryData>()
    for (const group of rawGroups) {
      if (!group) continue
      const key = group.date || group.dateGroup || 'unknown'
      if (!dateMap.has(key)) {
        dateMap.set(key, {
          ...group,
          transactions: [...(group.transactions || [])]
        })
      } else {
        const existing = dateMap.get(key)!
        const existingIds = new Set(existing.transactions.map((t: any) => t.id))
        for (const tx of group.transactions || []) {
          if (!existingIds.has(tx.id)) {
            existing.transactions.push(tx)
            existingIds.add(tx.id)
          }
        }
      }
    }
    return Array.from(dateMap.values())
  })

  const filteredHistory = computed(() => {
    if (activeTab.value === 'all') return transactionHistory.value
    return transactionHistory.value
      .map((group) => {
        const txs = (group.transactions || []).filter((tx) => {
          // type 1 = Session (Income)
          // type 2 = Transaction Detail (Expend)
          const isEarn =
            tx.type === 1 ||
            tx.typeName?.toLowerCase() === 'income' ||
            tx.typeName?.toLowerCase() === 'session' ||
            tx.typeName?.toLowerCase() === 'earn'
          return activeTab.value === 'earned' ? isEarn : !isEarn
        })
        return {
          ...group,
          transactions: txs
        }
      })
      .filter((group) => group.transactions.length > 0)
  })

  const setTab = (tab: TabType) => {
    activeTab.value = tab
  }

  // Sentinel and scroll handling for infinite scrolling
  const scrollContainer = ref<HTMLElement | null>(null)
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

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })
</script>

<template>
  <ion-page mode="ios" class="no-padding">
    <ion-content :fullscreen="true" :scroll-y="false">
      <div class="transaction-history-layout">
        <!-- Tabs: All | Top-up (Earned) | Payment (Spend) -->
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
                  >Income</ion-button
                >
              </ion-col>
              <ion-col>
                <ion-button
                  class="tab-btn"
                  :class="{ active: activeTab === 'spend' }"
                  expand="block"
                  fill="solid"
                  @click="setTab('spend')"
                  >Expend</ion-button
                >
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- History List Scroll -->
        <div
          ref="scrollContainer"
          class="history-list-scroll"
          @scroll.passive="handleScroll"
        >
          <!-- Loading state -->
          <div v-if="isLoading && filteredHistory.length === 0" class="loading-state">
            <ion-spinner name="crescent" color="primary" />
          </div>

          <!-- Error state -->
          <div v-else-if="isError && filteredHistory.length === 0" class="empty-state">
            <p>{{ error?.message || 'Failed to load transaction history' }}</p>
          </div>

          <!-- History Cards List -->
          <template v-else-if="filteredHistory.length > 0">
            <History
              v-for="item in filteredHistory"
              :key="item.date"
              :item="item"
              :disable-default-modal="true"
              @itemClick="handleItemClick"
              @click="handleItemClick"
            />

            <!-- Sentinel & Loading Indicator -->
            <div ref="sentinelEl" class="infinite-sentinel">
              <div v-if="isFetchingNextPage" class="loading-more">
                <ion-spinner name="crescent" color="primary" />
                <span>Loading more...</span>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <ion-text v-else class="empty-state">
            <p>No transaction history found.</p>
          </ion-text>
        </div>

        <!-- Transaction Detail Modal (fetches /sale-order/find/{transactionId}) -->
        <TransactionModal
          v-model:is-open="isDetailModalOpen"
          :transaction-id="selectedTransactionId"
          :item="selectedTransaction"
          @close="isDetailModalOpen = false"
          @did-dismiss="isDetailModalOpen = false"
        />
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
    padding: 0 !important;
  }

  .transaction-history-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    width: 100%;
    overflow: hidden;
    background-color: #f7f8fa;
  }

  .history-header-tabs {
    flex-shrink: 0;
    padding: 8px 12px 0 12px;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    z-index: 2;
  }

  .tab-row {
    padding: 0;
    margin-bottom: 8px;
  }

  .history-list-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    padding: 10px 14px;
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
