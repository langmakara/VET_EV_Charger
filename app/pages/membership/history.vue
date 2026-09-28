<script setup lang="ts">
  import { ref, computed } from 'vue'
  import {
    IonPage,
    IonContent,
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
  import evChargerData from '~/data/ev_charger_data.json'
  import type { HistoryItem } from '~/types'

  const activeTab = ref('all')

  const ev_charger_data = evChargerData.pointsHistory as HistoryItem[]

  const filteredData = computed(() => {
    if (activeTab.value === 'all') return ev_charger_data
    return ev_charger_data.filter((item) => item.type === activeTab.value)
  })

  const groupedData = computed(() => {
    const groups: Record<string, HistoryItem[]> = {}
    for (const item of filteredData.value) {
      ;(groups[item.dateGroup] ??= []).push(item)
    }
    return groups
  })
</script>

<template>
  <ion-page class="pagePadding">
    <ion-content :fullscreen="true" class="ion-padding">
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

      <!-- History List grouped by date -->
      <ion-list
        v-for="(items, dateLabel) in groupedData"
        :key="dateLabel"
        lines="none"
        class="history-group"
      >
        <ion-list-header class="date-header">
          <ion-label class="date-label">{{ dateLabel }}</ion-label>
        </ion-list-header>

        <ion-item v-for="item in items" :key="item.id" class="history-card" lines="none">
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
            :class="item.points > 0 ? 'points-earned' : 'points-spend'"
          >
            {{
              item.points > 0
                ? `+ ${item.points.toLocaleString()}`
                : `- ${Math.abs(item.points).toLocaleString()}`
            }}
            Points
          </ion-note>
        </ion-item>
      </ion-list>

      <ion-text v-if="Object.keys(groupedData).length === 0" class="empty-state">
        <p>No history found.</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .pagePadding {
    padding-top: 195px;
  }
  .tab-row {
    padding-top: 10px;
    margin-bottom: 4px;
  }

  .history-group {
    margin-top: 16px;
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
  }

  ion-button.tab-btn.active {
    --background: #fff3e6;
    --color: #df5e0e;
    font-weight: 600;
  }
</style>
