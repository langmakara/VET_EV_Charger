<template>
  <div class="input-group">
    <span v-if="label" class="field-label">
      {{ label }}<span v-if="required" class="required">*</span>
    </span>
    <div :class="['field-container', 'textarea-field-container', { 'has-error': error }]">
      <ion-textarea
        :placeholder="placeholder || label"
        :value="modelValue"
        @ionInput="onInput"
        class="field-textarea"
        :rows="rows"
      ></ion-textarea>
    </div>
    <span v-if="error && errorMessage" class="error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { IonTextarea } from "@ionic/vue";

withDefaults(
  defineProps<{
    label?: string;
    modelValue?: string | null;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    error?: boolean;
    errorMessage?: string;
  }>(),
  {
    required: false,
    rows: 4,
    error: false,
    errorMessage: "",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const onInput = (event: any) => {
  emit("update:modelValue", event?.detail?.value ?? event?.target?.value ?? "");
};
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: var(--ion-padding) 0;
}

.field-label {
  font-size: var(--app-font-size-normal);
  font-weight: 500;
  color: var(--app-color-text-primary, #1a1a1a);
}

.field-label .required {
  color: #eb445a;
  margin-left: 2px;
}

.field-container {
  display: flex;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid var(--app-color-border, #ececec);
  border-radius: 5px;
  padding: var(--ion-padding);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease;
}

.field-container:focus-within {
  border-color: var(--ion-color-primary);
}

.field-container.has-error {
  border-color: var(--ion-color-danger) !important;
}

.field-container.has-error:focus-within {
  border-color: var(--ion-color-danger) !important;
}

.error-message {
  color: var(--ion-color-danger);
  font-size: 12px;
  margin-top: 4px;
  padding-left: 4px;
}

.field-textarea {
  --padding-start: 2px; /* was 0: avoids caret clipping at the left edge */
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --background: transparent;
  --color: #1a1a1a;
  --border-width: 0;
  --border-style: none;
  --box-shadow: none;
  --highlight-color-focused: transparent;
  --highlight-color: transparent;
  --highlight-height: 0px;
  font-size: 14px;
  color: #1a1a1a;
  caret-color: #1a1a1a;
  width: 100%;
}

/* Force the caret on the native <textarea> inside ion-textarea */
.field-textarea :deep(textarea),
.field-textarea :deep(.native-textarea) {
  caret-color: #1a1a1a !important;
  color: #1a1a1a;
  opacity: 1;
}
</style>