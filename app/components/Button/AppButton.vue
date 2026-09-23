<template>
  <ion-button :color="color" :fill="fill" :expand="expand" :shape="shape" :size="size" :disabled="disabled" v-bind="$attrs" :type="type">
    <slot name="start" />
    <slot />
    <slot name="end" />
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton } from "@ionic/vue";

defineProps<{
  color?: string;
  fill?: "clear" | "outline" | "solid" | "default";
  expand?: "block" | "full";
  shape?: "round";
  size?: "small" | "default" | "large";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}>();
</script>

<style scoped>
ion-button {
  --height: 52px;
  min-height: 52px;
}

ion-button[size="small"] {
  --height: 36px;
  min-height: 36px;
}

ion-button::part(native) {
  /* Subtle, premium box shadow matching iOS design */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease-in-out;
}

/* Style for unselected/light solid buttons as in the screenshot */
ion-button[color="light"]::part(native) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
}

/* Subtle primary button glow */
ion-button[color="primary"]::part(native) {
  box-shadow: 0 4px 6px -1px rgba(227, 91, 0, 0.2), 0 2px 4px -2px rgba(227, 91, 0, 0.1);
}

/* Disable shadow for clear and outline buttons */
ion-button[fill="clear"]::part(native),
ion-button[fill="outline"]::part(native) {
  box-shadow: none !important;
}
</style>
