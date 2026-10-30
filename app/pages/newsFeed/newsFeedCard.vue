<script setup lang="ts">
  import { computed } from 'vue'
  import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle
  } from '@ionic/vue'
  import type { NewFeedData } from '~/api/types'
  import { formatDate } from '~/utils/formatters'

  const props = defineProps<{
    news: NewFeedData
  }>()

  const { baseUrl: evChargerBaseUrl } = useApiUrl('/vetEvChargerCustomerAPi', 5697)

  const newsImage = computed(() => {
    const img = props.news?.feedUrl || props.news?.profileUrl || (props.news as any)?.image
    if (!img) return '/images/station.svg'
    if (img.startsWith('http') || img.startsWith('data:')) return img
    if (
      img.startsWith('/images') ||
      img.startsWith('/icons') ||
      img.startsWith('/vet-ev-charger')
    ) {
      return img
    }
    return `${evChargerBaseUrl}${img.startsWith('/') ? '' : '/'}${img}`
  })

  const newsTitle = computed(() => {
    return (
      props.news?.titleEn ||
      props.news?.titleKh ||
      props.news?.titleZh ||
      (props.news as any)?.title ||
      ''
    )
  })

  const newsDesc = computed(() => {
    return (
      props.news?.descriptionEn ||
      props.news?.descriptionKh ||
      props.news?.descriptionZh ||
      (props.news as any)?.description ||
      ''
    )
  })

  const newsDate = computed(() => {
    const raw = props.news?.created || (props.news as any)?.date
    if (!raw) return ''
    const formatted = formatDate(raw, 'DD-MMM-YYYY')
    return formatted || raw
  })
</script>

<template>
  <ion-card mode="md">
    <div class="news-thumbnail">
      <img :alt="newsTitle" :src="newsImage" />
    </div>
    <ion-card-header>
      <ion-card-subtitle v-if="newsDate" class="line-clamp-2">{{ newsDate }}</ion-card-subtitle>
      <ion-card-title class="line-clamp-2">{{ newsTitle }}</ion-card-title>
    </ion-card-header>

    <ion-card-content v-if="newsDesc" class="font-size line-clamp-2">
      {{ newsDesc }}
    </ion-card-content>
  </ion-card>
</template>

<style scoped>
  .news-thumbnail {
    width: 100%;
    height: 150px;
    margin-top: 0;
    margin-bottom: 0;
  }

  .news-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .font-size {
    font-size: 14px;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    /* autoprefixer: ignore next */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
