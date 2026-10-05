<script setup lang="ts">
  import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/vue';

  defineProps({
    news: {
      type: Object,
      required: true
    }
  });
</script>

<template>
  <ion-card mode="md">
    <div class="news-thumbnail">
        <img :alt="news.title" :src="news.image" />
    </div>
    <ion-card-header>
      <ion-card-subtitle class="line-clamp-2">{{ news.date }}</ion-card-subtitle>
      <ion-card-title class=" line-clamp-2">{{ news.title }}</ion-card-title>
    </ion-card-header>

    <ion-card-content class="font-size line-clamp-2">
      {{ news.description }}
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
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>