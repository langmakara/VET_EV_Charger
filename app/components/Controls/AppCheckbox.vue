<template>
  <ion-checkbox
    :checked="modelValue"
    @ionChange="$emit('update:modelValue', ($event.target as any)?.checked)"
    :disabled="disabled"
    :color="color"
    class="custom-checkbox"
  >
    <slot />
  </ion-checkbox>
</template>

<script setup lang="ts">
import { IonCheckbox } from "@ionic/vue";

withDefaults(
  defineProps<{
    modelValue?: boolean;
    disabled?: boolean;
    color?: string;
  }>(),
  {
    modelValue: false,
    disabled: false,
    color: "primary",
  }
);

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<style scoped>
.custom-checkbox {
  --size: 20px;
  --border-radius: 6px;
  --border-color: var(--app-color-border);
  --border-width: 1.5px;
  --checkbox-background-checked: var(--ion-color-primary);
  --border-color-checked: var(--ion-color-primary);
  font-size: 14px;
  color: var(--app-color-text-primary);
}

/* Premium feedback micro-interaction when tapped/pressed */
.custom-checkbox::part(container) {
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-checkbox:active::part(container) {
  transform: scale(0.9);
}
</style>
