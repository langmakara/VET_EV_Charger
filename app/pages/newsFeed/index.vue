<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import evChargerData from '~/data/ev_charger_data.json'
import NewsFeedCard from './newsFeedCard.vue';

const { newsFeeds } = evChargerData
</script>

<template>
  <ion-page>
    <ion-content>
      <NewsFeedCard v-for="news in newsFeeds" :key="news.id" :news="news" />
    </ion-content>
  </ion-page>
</template>