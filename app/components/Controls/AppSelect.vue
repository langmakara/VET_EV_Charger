<template>
  <!-- Labeled select style to match AppInputField -->
  <div v-if="label" class="input-group">
    <span class="field-label"> {{ label }}<span v-if="required" class="required">*</span> </span>
    <div :class="['field-container', 'select-field-container', { 'has-error': error, 'is-disabled': disabled }]">
      <ion-select :value="modelValue" :disabled="disabled" @ionChange="$emit('update:modelValue', ($event.target as any)?.value)" @ionCancel="handleCancel" :aria-label="ariaLabel || placeholder || label" :interface="interface" :interface-options="interfaceOptions || defaultInterfaceOptions" :placeholder="placeholder" class="custom-select">
        <ion-select-option v-for="option in options" :key="option.value" :value="option.value"> {{ option.label }}{{ option.amount ? ` (${option.amount.startsWith("$") ? option.amount : "$" + option.amount})` : "" }} </ion-select-option>
      </ion-select>
    </div>
    <span v-if="error && errorMessage" class="error-message">{{ errorMessage }}</span>
  </div>

  <!-- Compact select style for grid usage -->
  <ion-item v-else lines="none" :class="['select-item-container', { 'has-badge': badge !== undefined, 'has-error': error, 'is-disabled': disabled }]">
    <div v-if="badge !== undefined">
      <div class="number-badge">
        {{ badge }}
      </div>
    </div>
    <ion-select :value="modelValue" :disabled="disabled" @ionChange="$emit('update:modelValue', ($event.target as any)?.value)" @ionCancel="handleCancel" :aria-label="ariaLabel || placeholder" :interface="interface" :interface-options="interfaceOptions || defaultInterfaceOptions" :placeholder="placeholder" class="custom-select">
      <ion-select-option v-for="option in options" :key="option.value" :value="option.value"> {{ option.label }}{{ option.amount ? ` (${option.amount.startsWith("$") ? option.amount : "$" + option.amount})` : "" }} </ion-select-option>
    </ion-select>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonSelect, IonSelectOption } from "@ionic/vue";

interface SelectOption {
  label: string;
  value: string | number;
  amount?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    options: SelectOption[];
    placeholder?: string;
    ariaLabel?: string;
    badge?: number | string;
    interface?: "action-sheet" | "popover" | "alert";
    interfaceOptions?: any;
    label?: string;
    required?: boolean;
    error?: boolean;
    errorMessage?: string;
    disabled?: boolean;
    clearable?: boolean;
    clearOnCancel?: boolean;
  }>(),
  {
    interface: "action-sheet",
    required: false,
    error: false,
    errorMessage: "",
    disabled: false,
    clearable: false,
    clearOnCancel: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "cancel"): void;
}>();

const handleCancel = () => {
  if (props.clearable || props.clearOnCancel) {
    emit("update:modelValue", "");
  }
  emit("cancel");
};

const defaultInterfaceOptions = {
  cssClass: "custom-action-sheet-50",
};
</script>

<style>
/* Unscoped style tag to style global ionic action sheets overlay wrapper */
.custom-action-sheet-50 {
  --height: 50% !important;
  --max-height: 50% !important;
}
</style>

<style scoped>
/* Labeled select styles matching AppInputField */
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
  align-items: center;
  width: 100%;
  min-height: 48px;
  background-color: #ffffff;
  border: 1px solid var(--app-color-border);
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease;
}

.field-container:focus-within {
  border-color: var(--ion-color-primary, #e35b00);
}

.field-container.has-error {
  border-color: var(--ion-color-danger, #eb445a) !important;
}

.field-container.has-error:focus-within {
  border-color: var(--ion-color-danger, #eb445a) !important;
}

.error-message {
  color: var(--ion-color-danger, #eb445a);
  font-size: 12px;
  margin-top: 4px;
  padding-left: 4px;
}

.select-field-container {
  padding: 0 var(--ion-padding);
}

.select-field-container .custom-select {
  --padding-start: 0;
  --padding-end: 0;
}

/* Compact select styles */
.select-item-container {
  --background: #ffffff;
  --border-radius: 5px;
  border-radius: 5px;
  --inner-padding-end: 8px;
  --padding-start: 12px;
  box-shadow: 0 2px 6px rgba(128, 128, 128, 0.466);
  width: 100%;
  min-height: 48px;
}

.select-item-container.has-badge {
  --padding-start: 0;
}

.select-item-container.has-error {
  border: 1px solid var(--ion-color-danger, #eb445a) !important;
}

.number-badge {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 50px;
  background-color: var(--ion-color-primary, #e35b00);
  color: #ffffff;
  font-size: var(--app-font-size-normal);
  font-weight: bold;
  margin-right: 8px;
}

.custom-select {
  width: 100%;
  font-size: var(--app-font-size-normal);
  color: var(--app-color-text-primary, #1a1a1a);
  --highlight-color-focused: transparent;
  --highlight-color: transparent;
  --highlight-height: 0px;
  --border-width: 0;
  --border-style: none;
  --opacity: 1;
}

.custom-select[disabled],
.custom-select.select-disabled,
.is-disabled .custom-select {
  opacity: 1 !important;
  --color: var(--app-color-text-primary, #1a1a1a) !important;
  --placeholder-color: var(--app-color-text-primary, #1a1a1a) !important;
  --placeholder-opacity: 1 !important;
  color: var(--app-color-text-primary, #1a1a1a) !important;
}

.custom-select::part(text) {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--app-color-text-primary, #1a1a1a) !important;
  opacity: 1 !important;
  -webkit-text-fill-color: var(--app-color-text-primary, #1a1a1a) !important;
}

.custom-select::part(placeholder) {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-item-container.is-disabled,
.field-container.is-disabled {
  opacity: 1;
  --background: #ffffff !important;
  background-color: #ffffff !important;
  background: #ffffff !important;
  pointer-events: none;
}
</style>
