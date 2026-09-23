<script setup lang="ts">
import { IonSpinner } from "@ionic/vue";
import CardSkeleton from "./CardSkeleton.vue";

interface Props {
  pending?: boolean;
  error?: any;
  isEmpty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  skeletonCount?: number;
  type?: "skeleton" | "spinner";
}

const props = withDefaults(defineProps<Props>(), {
  pending: false,
  error: null,
  isEmpty: false,
  emptyMessage: "",
  errorMessage: "",
  skeletonCount: 3,
  type: "skeleton",
});

const emit = defineEmits<{
  (e: "retry"): void;
}>();

const { t } = useI18n();

const handleRetry = () => {
  emit("retry");
};
</script>

<template>
  <div>
    <!-- Loading State -->
    <template v-if="pending">
      <slot name="loading">
        <CardSkeleton v-if="type === 'skeleton'" :count="skeletonCount" />
        <div v-else class="spinner-center-container ion-padding">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>
      </slot>
    </template>

    <!-- Empty State -->
    <template v-else-if="isEmpty">
      <slot name="empty">
        <div class="state-container ion-text-center ion-padding">
          <p>{{ emptyMessage || t('vehicle.noVehiclesFound') }}</p>
        </div>
      </slot>
    </template>

    <!-- Content State -->
    <template v-else>
      <slot></slot>
    </template>
  </div>
</template>

<style scoped>
.state-container,
.spinner-center-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  width: 100%;
  text-align: center;
}
</style>
