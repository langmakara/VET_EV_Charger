<template>
  <div class="star-rating" :style="{ gap: gap }">
    <ion-icon
      v-for="s in 5"
      :key="s"
      :src="s <= Math.floor(rating) ? resolveAsset('icons/star.svg') : resolveAsset('icons/star-notRating.svg')"
      :class="['star-rating__star', s <= Math.floor(rating) ? 'filled' : 'empty']"
      :style="{ fontSize: size, width: size, height: size }"
    ></ion-icon>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { useAssetResolver } from "~/composables/useAssetResolver";

const { resolveAsset } = useAssetResolver();

withDefaults(
  defineProps<{
    rating: number;
    size?: string;
    filledColor?: string;
    emptyColor?: string;
    gap?: string;
  }>(),
  {
    size: "16px",
    filledColor: "#f5a623",
    emptyColor: "#ddd",
    gap: "2px",
  },
);
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
}

.star-rating__star {
  display: inline-block;
  vertical-align: middle;
}
</style>
