<template>
  <div class="input-group">
    <span class="field-label">
      {{ label }}<span v-if="required" class="required">*</span>
    </span>
    <div :class="['field-container', { 'has-error': isDisplayingError }]">
      <ion-icon v-if="icon" :icon="icon" class="field-icon"></ion-icon>
      <ion-input
        :type="type"
        :placeholder="placeholder || label"
        :value="modelValue"
        :min="min"
        :max="max"
        @ionInput="onInput"
        @ionBlur="onBlur"
        :class="['field-input', { 'no-icon': !icon }]"
      ></ion-input>
    </div>
    <span v-if="isDisplayingError" class="error-message">{{ displayErrorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IonInput, IonIcon } from "@ionic/vue";

export type TextFieldTypes =
  | "text"
  | "password"
  | "email"
  | "number"
  | "search"
  | "tel"
  | "url"
  | "date"
  | "datetime-local"
  | "time";

const props = withDefaults(
  defineProps<{
    label: string;
    modelValue?: string | number | null;
    placeholder?: string;
    icon?: string;
    type?: TextFieldTypes;
    required?: boolean;
    error?: boolean;
    errorMessage?: string;
    min?: string | number;
    max?: string | number;
  }>(),
  {
    type: "text",
    required: false,
    error: false,
    errorMessage: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "blur", value: any): void;
}>();

const isTouched = ref(false);

const onInput = (event: any) => {
  isTouched.value = true;
  emit("update:modelValue", event?.target?.value);
};

const onBlur = (event: any) => {
  isTouched.value = true;
  emit("blur", event);
};

const computedErrorMsg = computed(() => {
  if (props.errorMessage) return props.errorMessage;

  const valStr = props.modelValue == null ? "" : String(props.modelValue).trim();

  // 1. Required empty check
  if (props.required && valStr === "") {
    return `${props.label} is required`;
  }

  // 2. Type: number validation
  if (props.type === "number" && valStr !== "") {
    const num = Number(valStr);
    const minVal = props.min !== undefined ? Number(props.min) : 1;
    const maxVal = props.max !== undefined && props.max !== "" ? Number(props.max) : undefined;
    if (isNaN(num) || num < minVal) {
      if (minVal === 1 || minVal === 0) {
        return `${props.label} must be greater than 0`;
      }
      return `${props.label} must be at least ${minVal}`;
    }
    if (maxVal !== undefined && !isNaN(maxVal) && maxVal > 0 && num > maxVal) {
      return `${props.label} cannot exceed ${maxVal}`;
    }
  }

  // 3. Type: tel validation
  if (props.type === "tel" && valStr !== "") {
    const digits = valStr.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return `A valid ${props.label.toLowerCase()} is required`;
    }
  }

  return "";
});

const isInvalid = computed(() => computedErrorMsg.value !== "");

const isDisplayingError = computed(() => {
  return (isTouched.value || props.error) && isInvalid.value;
});

const displayErrorMessage = computed(() => {
  return computedErrorMsg.value;
});
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
}
.field-label {
  font-size: var(--app-font-size-normal);
  font-weight: 500;
  color: var(--app-color-text-primary);
}
.field-label .required {
  color: #eb445a;
  margin-left: 2px;
}
.field-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  background-color: #ffffff;
  border: 1px solid var(--app-color-border);
  border-radius: 5px;
  padding: 0 var(--ion-padding);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease;
}
.field-container:focus-within {
  border-color: var(--ion-color-primary);
}
.field-container.has-error {
  border-color: var(--ion-color-danger);
}
.field-container.has-error:focus-within {
  border-color: var(--ion-color-danger);
}
.error-message {
  color: var(--ion-color-danger);
  font-size: var(--app-font-size-normal);
  margin-top: 4px;
  padding-left: 4px;
}
.field-icon {
  font-size: 20px;
  color: #555555;
  margin-right: 12px;
  flex-shrink: 0;
}
.field-input {
  --padding-start: 0;
  --padding-end: 0;
  --background: transparent;
  --border-width: 0;
  --border-style: none;
  --box-shadow: none;
  --highlight-color-focused: transparent;
  --highlight-color: transparent;
  --highlight-height: 0px;
  font-size: 14px;
  color: var(--app-color-text-primary, #1a1a1a);
  flex: 1;
}
</style>
