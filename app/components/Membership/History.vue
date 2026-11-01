<script setup lang="ts">
  import { ref, computed } from 'vue'
  import {
    IonList,
    IonListHeader,
    IonItem,
    IonAvatar,
    IonLabel,
    IonNote
  } from '@ionic/vue'
  import Icon from '~/components/Icon/icon.vue'
  import TransactionModal from '~/components/Modal/TransactionModal.vue'
  import DetailModal from '~/pages/charging_history/detailModal.vue'
  import type { ChargeHistoryData, ChargeHistoryTransaction, TransactionHistory, TransactionHistoryData } from '~/api/types'
  import type { HistoryItem } from '~/types'

  const props = withDefaults(
    defineProps<{
      item?: ChargeHistoryData | TransactionHistoryData | TransactionHistoryData | TransactionHistory | any
      dataSource?: 'pointsHistory' | 'chargingHistory'
      disableDefaultModal?: boolean
    }>(),
    {
      item: null,
      dataSource: 'pointsHistory',
      disableDefaultModal: false
    }
  )

  const emit = defineEmits<{
    (e: 'itemClick', item: any): void
    (e: 'click', item: any): void
  }>()

  const isChargingHistory = computed(() => props.dataSource === 'chargingHistory')

  function formatDateLabel(dateStr?: string): string {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    let date: Date
    if (parts.length === 3) {
      date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    } else {
      date = new Date(dateStr)
    }
    if (isNaN(date.getTime())) return dateStr

    const today = new Date()
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()

    if (isToday) return 'Today'
    if (isYesterday) return 'Yesterday'

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Determine whether `item` is a date group with transactions, or a single transaction
  const transactions = computed<any[]>(() => {
    if (Array.isArray(props.item?.transactions)) {
      return props.item.transactions
    }
    return []
  })

  const singleTransaction = computed<any | null>(() => {
    if (!props.item) return null
    if (Array.isArray(props.item?.transactions)) return null
    return props.item
  })

  const dateLabel = computed(() => {
    if (props.item?.date) {
      return formatDateLabel(props.item.date)
    }
    if (props.item?.dateGroup) {
      return props.item.dateGroup
    }
    return ''
  })

  const isEarn = (tx: any): boolean => {
    return (
      tx.type === 1 ||
      tx.type === 'earned' ||
      tx.typeName?.toLowerCase() === 'earn' ||
      tx.typeName?.toLowerCase() === 'income' ||
      tx.typeName?.toLowerCase() === 'session'
    )
  }

  const getTitle = (tx: any): string => {
    return tx.description || tx.stationName || tx.title || (isEarn(tx) ? 'Charging Session' : 'Transaction')
  }

  const getDatetime = (tx: any): string => {
    return tx.created || tx.createdDate || tx.datetime || ''
  }

  const getPoints = (tx: any): number => {
    return Number(tx.points) || 0
  }

  const selectedItem = ref<any | null>(null)
  const isModalOpen = ref(false)

  const handleCardClick = (tx: any) => {
    selectedItem.value = tx
    emit('itemClick', tx)
    emit('click', tx)
    if (!props.disableDefaultModal) {
      isModalOpen.value = true
    }
  }

  const isEarnedModal = computed(() => {
    if (!selectedItem.value) return false
    return isEarn(selectedItem.value)
  })

  const modalTitle = computed(() => {
    return isEarnedModal.value ? 'Session Detail' : 'Transaction Detail'
  })

  const formattedId = computed(() => {
    if (!selectedItem.value) return '00000'
    const idVal =
      selectedItem.value.transactionId ??
      selectedItem.value.code ??
      selectedItem.value.salesOrderId ??
      selectedItem.value.id
    return idVal ? String(idVal) : '00000'
  })

  function formatCurrency(val?: number): string {
    if (val == null) return ''
    const num = Math.abs(val)
    if (num >= 500) {
      return `KHR (៛) ${Math.round(num).toLocaleString()}`
    }
    return `$${num.toFixed(2)}`
  }

  const mockAmount = computed(() => {
    if (!selectedItem.value) return '$0.00'
    if (selectedItem.value.formattedAmount) {
      return selectedItem.value.formattedAmount
    }
    if (selectedItem.value.amount != null) {
      return formatCurrency(selectedItem.value.amount)
    }
    if (selectedItem.value.kwh) {
      return `${selectedItem.value.kwh} kWh`
    }
    return `$${(selectedItem.value.points ?? 0).toFixed(2)}`
  })
</script>

<template>
  <div class="history-card-wrapper">
    <!-- Date Group of Cards -->
    <ion-list v-if="transactions.length > 0" lines="none" class="history-group">
      <ion-list-header v-if="dateLabel" class="date-header">
        <ion-label class="date-label">{{ dateLabel }}</ion-label>
      </ion-list-header>

      <ion-item
        v-for="tx in transactions"
        :key="tx.id"
        class="history-card"
        lines="none"
        button
        @click="handleCardClick(tx)"
      >
        <!-- Icon -->
        <ion-avatar
          slot="start"
          class="item-icon"
          :class="isEarn(tx) ? 'icon-earned' : 'icon-spend'"
        >
          <Icon
            :name="isEarn(tx) ? 'credit-card-plus' : 'credit-card-minus'"
            size="22px"
          />
        </ion-avatar>

        <!-- Info -->
        <ion-label class="item-info">
          <h3 class="item-title">{{ getTitle(tx) }}</h3>
          <p class="item-datetime">{{ getDatetime(tx) }}</p>
        </ion-label>

        <!-- Points / Amount -->
        <ion-note
          slot="end"
          class="item-points"
          :class="isEarn(tx) ? 'points-earned' : 'points-spend'"
        >
          <template v-if="tx.formattedAmount">
            {{ tx.formattedAmount }}
          </template>
          <template v-else-if="tx.amount != null && tx.points == null">
            {{
              isEarn(tx)
                ? `+ ${formatCurrency(tx.amount)}`
                : `- ${formatCurrency(tx.amount)}`
            }}
          </template>
          <template v-else>
            {{
              getPoints(tx) > 0
                ? `+ ${getPoints(tx).toLocaleString()}`
                : `- ${Math.abs(getPoints(tx)).toLocaleString()}`
            }}
            Points
          </template>
        </ion-note>
      </ion-item>
    </ion-list>

    <!-- Single Transaction Card -->
    <ion-item
      v-else-if="singleTransaction"
      class="history-card single-card"
      lines="none"
      button
      @click="handleCardClick(singleTransaction)"
    >
      <ion-avatar
        slot="start"
        class="item-icon"
        :class="isEarn(singleTransaction) ? 'icon-earned' : 'icon-spend'"
      >
        <Icon
          :name="isEarn(singleTransaction) ? 'credit-card-plus' : 'credit-card-minus'"
          size="22px"
        />
      </ion-avatar>

      <ion-label class="item-info">
        <h3 class="item-title">{{ getTitle(singleTransaction) }}</h3>
        <p class="item-datetime">{{ getDatetime(singleTransaction) }}</p>
      </ion-label>

      <ion-note
        slot="end"
        class="item-points"
        :class="isEarn(singleTransaction) ? 'points-earned' : 'points-spend'"
      >
        <template v-if="singleTransaction.formattedAmount">
          {{ singleTransaction.formattedAmount }}
        </template>
        <template v-else-if="singleTransaction.amount != null && singleTransaction.points == null">
          {{
            isEarn(singleTransaction)
              ? `+ ${formatCurrency(singleTransaction.amount)}`
              : `- ${formatCurrency(singleTransaction.amount)}`
          }}
        </template>
        <template v-else>
          {{
            getPoints(singleTransaction) > 0
              ? `+ ${getPoints(singleTransaction).toLocaleString()}`
              : `- ${Math.abs(getPoints(singleTransaction)).toLocaleString()}`
          }}
          Points
        </template>
      </ion-note>
    </ion-item>

    <!-- Charging History Modal -->
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
      :type="isEarnedModal ? 'session' : 'transaction'"
      :transaction-id="selectedItem?.transactionId || selectedItem?.code || (selectedItem?.id ? String(selectedItem.id) : '')"
      :item="selectedItem"
      @did-dismiss="isModalOpen = false"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
  .history-card-wrapper {
    width: 100%;
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

  .single-card {
    margin-top: 8px;
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

  .bold-value {
    font-weight: 600 !important;
    color: #1f232d !important;
  }
</style>
