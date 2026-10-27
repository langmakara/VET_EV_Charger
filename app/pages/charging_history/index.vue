<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import History from '~/components/Membership/History.vue'
import DetailModal from './detailModal.vue'
import type { HistoryItem } from '~/types'

const isDetailModalOpen = ref(false)
const selectedHistoryItem = ref<HistoryItem | null>(null)
const modalType = ref<'transaction' | 'session'>('transaction')

const handleItemClick = (item: HistoryItem) => {
  selectedHistoryItem.value = item
  // Clicked Earned -> Session Detail, Clicked Spend -> Transaction Detail
  modalType.value = item.type === 'earned' ? 'session' : 'transaction'
  isDetailModalOpen.value = true
}
</script>

<template>
  <ion-page>
    <ion-content>
      <History
        data-source="chargingHistory"
        :disable-default-modal="true"
        @item-click="handleItemClick"
      />
      <DetailModal
        v-model:is-open="isDetailModalOpen"
        :type="modalType"
        :item="selectedHistoryItem"
        @close="isDetailModalOpen = false"
      />
    </ion-content>
  </ion-page>
</template>

<style scoped>
ion-page {
  padding: 0 !important;
}
</style>