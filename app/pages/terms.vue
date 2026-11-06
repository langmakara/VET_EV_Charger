<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div v-if="isPending" class="ion-text-center" style="padding: 20px;">
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
import { computed, ref, watch, onMounted } from "vue";
import { IonPage, IonContent, IonSpinner, IonText } from "@ionic/vue";
import { usePrivacyPolicyDropdownQuery } from "~/composables/queries";

const { t, locale } = useI18n();

const {
  data: dropdownResponse,
  isPending: isQueryPending,
  error: queryError,
} = usePrivacyPolicyDropdownQuery({
  page: 1,
  rowsPerPage: 10,
});

const isFetchingFile = ref(false);
const fileFetchError = ref<Error | null>(null);
const rawHtml = ref("");

const policyItem = computed(() => {
  const res = dropdownResponse.value;
  const data = (res as any)?.data ?? res?.body?.data;
  if (Array.isArray(data)) {
    return data[0] || null;
  }
  return data || null;
});

const targetPathOrContent = computed(() => {
  const item = policyItem.value;
  if (!item) return "";

  const loc = locale.value;
  if (loc === "km") return item.descriptionKh || "";
  if (loc === "zh") return item.descriptionCh || item.descriptionZh || "";
  return item.descriptionEn || item.descriptionKh || "";
});

const resolveFileUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const config = useRuntimeConfig();
  const apiBase = (config.public.apiBase as string) || "";
  return `${apiBase.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

watch(
  targetPathOrContent,
  async (val) => {
    if (!val) {
      rawHtml.value = "";
      return;
    }

    const trimmed = val.trim();
    const isFilePath =
      trimmed.endsWith(".html") ||
      trimmed.endsWith(".htm") ||
      trimmed.startsWith("/upload/") ||
      (trimmed.includes("/upload/") && !trimmed.startsWith("<"));

    if (!isFilePath) {
      rawHtml.value = val;
      return;
    }

    isFetchingFile.value = true;
    fileFetchError.value = null;

    try {
      const primaryUrl = resolveFileUrl(trimmed);
      let res = await fetch(primaryUrl);

      // Fallback: If 404, try root origin path in case backend upload folder is outside API context
      if (!res.ok && !trimmed.startsWith("http")) {
        try {
          const config = useRuntimeConfig();
          const apiBase = (config.public.apiBase as string) || "";
          const origin = new URL(apiBase).origin;
          const fallbackUrl = `${origin.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
          const fallbackRes = await fetch(fallbackUrl);
          if (fallbackRes.ok) {
            res = fallbackRes;
          }
        } catch {}
      }

      if (!res.ok) {
        throw new Error(`Failed to load document (${res.status})`);
      }

      rawHtml.value = await res.text();
    } catch (err: any) {
      console.error("Error loading privacy policy file:", err);
      fileFetchError.value = err;
      rawHtml.value = "";
    } finally {
      isFetchingFile.value = false;
    }
  },
  { immediate: true }
);

const isPending = computed(() => isQueryPending.value || isFetchingFile.value);
const error = computed(() => queryError.value || fileFetchError.value);

const termsContent = computed(() => {
  let content = rawHtml.value;
  if (!content) return "";

  // Extract body content if it's a full HTML document
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    content = bodyMatch[1];
  }

  // Replace &nbsp; and non-breaking space characters with normal spaces
  // so text wraps naturally between words instead of breaking mid-word
  return content.replace(/&nbsp;|\u00a0/gi, " ");
});
</script>

<style scoped>
@import "~/assets/css/terms.css";
</style>
