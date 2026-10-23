<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div v-if="pending" class="ion-text-center" style="padding: 20px;">
        <ion-spinner name="crescent"></ion-spinner>
      </div>
      <div v-else-if="error" class="ion-text-center" style="padding: 20px;">
        <ion-text color="danger">{{ t("common.error") }}</ion-text>
      </div>
      <div v-else class="terms-content" v-html="termsContent"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonPage, IonContent, IonSpinner, IonText } from "@ionic/vue";
import { termsRepository } from "~/apis/terms.repository";

const { t, locale } = useI18n();

const { data: termsResponse, pending, error } = await termsRepository.getPrivacyTerms(2);

const termsContent = computed(() => {
  const data = termsResponse.value?.data;
  if (!data) return '';

  const loc = locale.value;
  let content = '';
  if (loc === 'km') content = data.descriptionKh || '';
  else if (loc === 'zh') content = data.descriptionZh || '';
  else content = data.descriptionEn || data.descriptionKh || '';

  // Replace &nbsp; and non-breaking space characters with normal spaces
  // so text wraps naturally between words instead of breaking mid-word
  return content.replace(/&nbsp;|\u00a0/gi, ' ');
});
</script>

<style scoped>
@import "~/assets/css/terms.css";
</style>