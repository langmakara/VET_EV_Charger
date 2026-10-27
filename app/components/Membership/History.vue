<script setup lang="ts">
  import { ref, computed } from 'vue'
  import {
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonList,
    IonListHeader,
    IonItem,
    IonAvatar,
    IonLabel,
    IonNote,
    IonText
  } from '@ionic/vue'
  import { useRoute } from 'vue-router'
  import evChargerData from '~/data/ev_charger_data.json'
  import TransactionModal from '~/components/Modal/TransactionModal.vue'
  import DetailModal from '~/pages/charging_history/detailModal.vue'
  import type { HistoryItem } from '~/types'

  const props = withDefaults(
    defineProps<{
      dataSource?: 'pointsHistory' | 'chargingHistory'
      disableDefaultModal?: boolean
    }>(),
    {
      dataSource: 'pointsHistory',
      disableDefaultModal: false
    }
  )

  const emit = defineEmits<{
    (e: 'itemClick', item: HistoryItem): void
  }>()

  const route = useRoute()
  const isChargingHistory = computed(
    () => props.dataSource === 'chargingHistory' || route?.path?.includes('charging_history')
  )

  const activeTab = ref('all')

  const ev_charger_data = computed(() => {
    return (
      isChargingHistory.value
        ? ((evChargerData as any).chargingHistory || [])
        : (evChargerData.pointsHistory || [])
    ) as (HistoryItem & { formattedAmount?: string })[]
  })

  const filteredData = computed(() => {
    if (activeTab.value === 'all') return ev_charger_data.value
    return ev_charger_data.value.filter((item) => item.type === activeTab.value)
  })

  const groupedData = computed(() => {
    const groups: Record<string, HistoryItem[]> = {}
    for (const item of filteredData.value) {
      ;(groups[item.dateGroup] ??= []).push(item)
    }
    return groups
  })

  const selectedItem = ref<(HistoryItem & Record<string, any>) | null>(null)
  const isModalOpen = ref(false)

  const openTransactionModal = (item: HistoryItem) => {
    selectedItem.value = item
    emit('itemClick', item)
    if (!props.disableDefaultModal) {
      isModalOpen.value = true
    }
  }

  const isEarned = computed(() => selectedItem.value?.type === 'earned')

  const modalTitle = computed(() => {
    return isEarned.value ? 'Top-up Detail' : 'Transaction Detail'
  })

  const formattedId = computed(() => {
    if (!selectedItem.value) return '00000'
    return selectedItem.value.id.toString().padStart(5, '0')
  })

  const mockAmount = computed(() => {
    if (!selectedItem.value) return '$0.00'
    if (selectedItem.value.formattedAmount) {
      return selectedItem.value.formattedAmount
    }
    return `$${(selectedItem.value.points ?? 0).toFixed(2)}`
  })
</script>

<template>
  <div class="history-container">
    <div class="history-header-tabs">
      <ion-grid>
        <ion-row class="tab-row">
          <ion-col>
            <ion-button
              class="tab-btn"
              :class="{ active: activeTab === 'all' }"
              expand="block"
              fill="solid"
              @click="activeTab = 'all'"
              >All</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              class="tab-btn"
              :class="{ active: activeTab === 'earned' }"
              expand="block"
              fill="solid"
              @click="activeTab = 'earned'"
              >Earned</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              class="tab-btn"
              :class="{ active: activeTab === 'spend' }"
              expand="block"
              fill="solid"
              @click="activeTab = 'spend'"
              >Spend</ion-button
            >
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>

    <!-- History List grouped by date -->
    <div class="history-list-scroll">
      <ion-list
        v-for="(items, dateLabel) in groupedData"
        :key="dateLabel"
        lines="none"
        class="history-group"
      >
        <ion-list-header class="date-header">
          <ion-label class="date-label">{{ dateLabel }}</ion-label>
        </ion-list-header>

        <ion-item
          v-for="item in items"
          :key="item.id"
          class="history-card"
          lines="none"
          button
          @click="openTransactionModal(item)"
        >
          <!-- Icon -->
          <ion-avatar
            slot="start"
            class="item-icon"
            :class="item.type === 'earned' ? 'icon-earned' : 'icon-spend'"
          >
            <Icon
              :name="item.type === 'earned' ? 'credit-card-plus' : 'credit-card-minus'"
              size="22px"
            />
          </ion-avatar>

          <!-- Info -->
          <ion-label class="item-info">
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-datetime">{{ item.datetime }}</p>
          </ion-label>

          <!-- Points -->
          <ion-note
            slot="end"
            class="item-points"
            :class="item.type === 'earned' ? 'points-earned' : 'points-spend'"
          >
            <template v-if="item.formattedAmount">
              {{ item.formattedAmount }}
            </template>
            <template v-else>
              {{
                item.points > 0
                  ? `+ ${item.points.toLocaleString()}`
                  : `- ${Math.abs(item.points).toLocaleString()}`
              }}
              Points
            </template>
          </ion-note>
        </ion-item>
      </ion-list>

      <ion-text v-if="Object.keys(groupedData).length === 0" class="empty-state">
        <p>No history found.</p>
      </ion-text>
    </div>

    <!-- Charging History Modal (Session Detail / Transaction Detail) -->
    <DetailModal
      v-if="isChargingHistory && !disableDefaultModal"
      :is-open="isModalOpen"
      :item="selectedItem"
      :type="selectedItem?.type === 'earned' ? 'session' : 'transaction'"
      @close="isModalOpen = false"
    />

    <!-- Points History Transaction Modal -->
    <TransactionModal
      v-else-if="!isChargingHistory && !disableDefaultModal"
      :is-open="isModalOpen"
      :title="modalTitle"
      @did-dismiss="isModalOpen = false"
    >
      <template v-if="selectedItem">
        <!-- Top-up Detail (Earned) -->
        <template v-if="isEarned">
          <ion-item>
            <ion-label color="medium">Date</ion-label>
            <ion-note slot="end" color="dark">{{ selectedItem.datetime }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label color="medium">Amount</ion-label>
            <ion-note slot="end" color="dark">{{ mockAmount }}</ion-note>
          </ion-item>
          <ion-item lines="none">
            <ion-label color="medium">Point Earned</ion-label>
            <ion-note slot="end" class="points-earned"
              >+ {{ selectedItem.points.toLocaleString() }} Points</ion-note
            >
          </ion-item>
        </template>

        <!-- Transaction Detail (Spend) -->
        <template v-else>
          <ion-item>
            <ion-label color="medium">Transaction id</ion-label>
            <ion-note slot="end" color="dark">{{ formattedId }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label color="medium">Station Name</ion-label>
            <ion-note slot="end" color="dark">{{
              selectedItem.stationName || selectedItem.title
            }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label color="medium">Order Date</ion-label>
            <ion-note slot="end" color="dark">{{ selectedItem.datetime }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label color="medium">Sub Total</ion-label>
            <ion-note slot="end" color="dark">{{ selectedItem.subTotal }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label color="medium">Discount (20%)</ion-label>
            <ion-note slot="end" color="dark">{{ selectedItem.discount }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label color="medium">Total Amount</ion-label>
            <ion-note slot="end" class="bold-value">{{
              selectedItem.totalAmount ||
              selectedItem.formattedAmount ||
              'KHR (៛) 44,000'
            }}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label color="medium">Total kWh</ion-label>
            <ion-note slot="end" class="bold-value">{{ selectedItem.totalKwh }}</ion-note>
          </ion-item>
          <ion-item lines="none">
            <ion-label color="medium">Point Spend</ion-label>
            <ion-note slot="end" class="points-spend"
              >- {{ Math.abs(selectedItem.points).toLocaleString() }} Points</ion-note
            >
          </ion-item>
        </template>
      </template>
    </TransactionModal>
  </div>
</template>

<style scoped>
  ion-page {
    padding: 0 !important;
  }

  .history-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    width: 100%;
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

  .history-group {
    margin-top: 12px;
    background: transparent;
    padding: 0;
  }

  .date-header {
    --background: transparent;
    padding-inline-start: 4px;
    min-height: unset;
    margin-bottom: 8px;
  }

  .date-label {
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #8c92a0 !important;
    margin: 0;
  }

  .history-card {
    --background: #ffffff;
    --border-radius: 14px;
    --padding-top: 10px;
    --padding-bottom: 10px;
    --padding-start: 14px;
    --padding-end: 14px;
    --inner-padding-end: 0;
    margin-bottom: 10px;
    border-radius: 14px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  }

  .item-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-inline-end: 14px;
  }

  .icon-earned {
    background: #22a15b;
  }

  .icon-spend {
    background: #e84040;
  }

  .item-info {
    flex: 1;
  }

  .item-title {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #1f232d !important;
    margin: 0 0 3px !important;
  }

  .item-datetime {
    font-size: 12px !important;
    color: #8c92a0 !important;
    margin: 0 !important;
  }

  .item-points {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
  }

  .points-earned {
    color: #22a15b;
  }

  .points-spend {
    color: #e84040;
  }

  .empty-state {
    display: block;
    text-align: center;
    color: #8c92a0;
    margin-top: 48px;
    font-size: 14px;
  }

  .bold-value {
    font-weight: 600 !important;
    color: #1f232d !important;
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
