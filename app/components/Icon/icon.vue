<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  name: string;
  size?: string;
  color?: string;
}>();

type IconDef = {
  viewBox: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  body: string;
};

const defaultOutline: Partial<IconDef> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const defaultFill: Partial<IconDef> = {
  fill: "currentColor",
};

const icons: Record<string, IconDef> = {
  flash: {
    viewBox: "0 0 24 24",
    ...defaultFill,
    body: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />'
  },
  HistoryIcon: {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15l-3.5-3-3.5 3-3.5-3-3.5 3Z" />'
  },
  station: {
    viewBox: "0 0 24 24",
    ...defaultFill,
    body: '<path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11C16.17 7 15.5 7.93 15.5 9v11h2V9c0-.69.28-1.32.73-1.77zM12 10H6V5h6v5zm0 2H6v9h6v-9zm-6-9h6c1.1 0 2 .9 2 2v14H4V5c0-1.1.9-2 2-2z"/>'
  },
  heart: {
    viewBox: "0 0 24 24",
    ...defaultFill,
    body: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>'
  },
  ticket: {
    viewBox: "0 0 24 24",
    ...defaultFill,
    body: '<path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z"/>'
  },
  'chevron-right': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="m9 18 6-6-6-6" />'
  },
  'dollar': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />'
  },
  'location': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />'
  },
  'plug': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />'
  },
  'gbt': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="8" r="2" /><circle cx="8" cy="14" r="2" /><circle cx="16" cy="14" r="2" />'
  },
  'ccs2': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<rect x="6" y="4" width="12" height="10" rx="4" /><circle cx="10" cy="9" r="1.5" /><circle cx="14" cy="9" r="1.5" /><rect x="4" y="14" width="16" height="6" rx="3" /><circle cx="9" cy="17" r="1.5" /><circle cx="15" cy="17" r="1.5" />'
  }
};

const iconDef = computed(() => icons[props.name]);
const sizeStyle = computed(() => props.size ? { width: props.size, height: props.size } : { width: '1.2em', height: '1.2em' });
</script>

<template>
  <svg 
    v-if="iconDef"
    xmlns="http://www.w3.org/2000/svg" 
    :viewBox="iconDef.viewBox || '0 0 20 20'" 
    :fill="iconDef.fill === 'none' ? 'none' : (color || iconDef.fill || 'currentColor')" 
    :stroke="iconDef.stroke ? (color || iconDef.stroke) : 'none'"
    :stroke-width="iconDef.strokeWidth || '0'"
    :stroke-linecap="iconDef.strokeLinecap as any"
    :stroke-linejoin="iconDef.strokeLinejoin as any"
    :style="sizeStyle"
    class="custom-icon"
    v-html="iconDef.body"
  ></svg>
</template>

<style scoped>
.custom-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
