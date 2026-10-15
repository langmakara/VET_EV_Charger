<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message?: string;
    highlightText?: string;
    duration?: number;
    position?: 'top' | 'bottom';
  }>(),
  {
    isOpen: false,
    type: 'success',
    title: 'Success',
    message: 'Voucher added successfully',
    highlightText: 'Voucher Code',
    duration: 3500,
    position: 'top',
  }
);

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'close'): void;
}>();

let timer: ReturnType<typeof setTimeout> | null = null;

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const close = () => {
  clearTimer();
  emit('update:isOpen', false);
  emit('close');
};

watch(
  () => props.isOpen,
  (val) => {
    clearTimer();
    if (val && props.duration > 0) {
      timer = setTimeout(() => {
        close();
      }, props.duration);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div
        v-if="isOpen"
        class="toast-alert-wrapper"
        :class="[`position-${position}`, `type-${type}`]"
        @click="close"
      >
        <div class="toast-alert-card">
          <div class="toast-title" :class="`title-${type}`">
            {{ title }}
          </div>
          <div class="toast-message">
            <span>{{ message }} </span>
            <strong v-if="highlightText" class="highlight-text"> {{ highlightText }}</strong>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-alert-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 99999;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  pointer-events: none;
}

.position-top {
  top: 24px;
}

.position-bottom {
  bottom: 24px;
}

.toast-alert-card {
  pointer-events: auto;
  cursor: pointer;
  background-color: #f5f5f7;
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  user-select: none;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.toast-alert-card:active {
  transform: scale(0.98);
}

.toast-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.title-success {
  color: #00a651;
}

.title-error {
  color: #e53935;
}

.title-warning {
  color: #f59e0b;
}

.title-info {
  color: #2563eb;
}

.toast-message {
  font-size: 14px;
  color: #5a6578;
  line-height: 1.4;
}

.highlight-text {
  font-weight: 700;
  color: #2d3748;
}

/* Animations */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.position-top.toast-slide-enter-from,
.position-top.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-24px) scale(0.96);
}

.position-bottom.toast-slide-enter-from,
.position-bottom.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
</style>
