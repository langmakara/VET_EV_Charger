<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { IonPage, IonContent, IonSpinner, IonText } from '@ionic/vue'
  import NewsFeedCard from './newsFeedCard.vue'
  import { useNewFeedQuery } from '~/composables/queries/dropdonwQueries'
  import type { NewFeedData } from '~/api/types'

  const filter = ref({
    page: 1,
    rowsPerPage: 25
  })

  const { data: newsFeedRes, isLoading, isError, error } = useNewFeedQuery(filter)

  const newFeeds = computed<NewFeedData[]>(() => {
    const raw: any = newsFeedRes.value?.data ?? newsFeedRes.value?.body?.data
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.list)) return raw.list
    return []
  })
</script>

<template>
  <ion-page>
    <ion-content>
      <!-- Loading indicator -->
      <div v-if="isLoading" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-spinner name="crescent" />
      </div>

      <!-- Error state -->
      <div v-else-if="isError" class="ion-text-center ion-padding">
        <ion-text color="danger">{{ error?.message || 'Failed to load news feeds' }}</ion-text>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="newFeeds.length === 0"
        class="ion-text-center ion-padding"
        style="margin-top: 40px"
      >
        <ion-text color="medium">No news feed available</ion-text>
      </div>

      <!-- News feed list -->
      <div v-else>
        <NewsFeedCard v-for="news in newFeeds" :key="news.id" :news="news" />
      </div>
    </ion-content>
  </ion-page>
</template>
