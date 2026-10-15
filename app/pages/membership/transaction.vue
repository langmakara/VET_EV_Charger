<script setup lang="ts">
import TransactionModal from '~/components/Modal/TransactionModal.vue';
import type { HistoryItem } from '~/types';
import type { PropType } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Transaction Detail'
  },
  item: {
    type: Object as PropType<HistoryItem | null>,
    default: null
  },
  initialBreakpoint: {
    type: Number,
    default: 0.60
  },
  breakpoints: {
    type: Array as PropType<number[]>,
    default: () => [0, 0.60, 0.9, 1]
  }
});

const emit = defineEmits(['did-dismiss', 'close', 'update:isOpen']);
</script>

<template>
  <TransactionModal
    :is-open="isOpen"
    :title="title"
    :initial-breakpoint="initialBreakpoint"
    :breakpoints="breakpoints"
    @did-dismiss="emit('did-dismiss')"
    @close="emit('close')"
    @update:is-open="emit('update:isOpen', $event)"
  >
    <template #title v-if="$slots.title">
      <slot name="title" />
    </template>
    <slot />
  </TransactionModal>
</template>