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
import { usePrivacyTermsQuery } from "~/composables/queries/useTermsQueries";

const { t, locale } = useI18n();

const { data: termsResponse, isPending: pending, error } = usePrivacyTermsQuery(2);

const termsContent = computed(() => {
  const data = termsResponse.value?.data;
  if (!data) return "";

  const loc = locale.value;
  if (loc === "km") return data.descriptionKh || "";
  if (loc === "zh") return data.descriptionZh || "";
  return data.descriptionEn || data.descriptionKh || "";
});
</script>

<style scoped>
@import "~/assets/css/terms.css";
</style>