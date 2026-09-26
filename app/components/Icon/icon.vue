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
    body: '<path fill-rule="evenodd" clip-rule="evenodd" d="M14 3a2 2 0 0 0-2 2v16h10V5a2 2 0 0 0-2-2h-6zm.5 8.5H13l3.5-6v4h1.5l-3.5 6v-4z M4 2h2v4H4V2zm4 0h2v4H8V2z M3 6h8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6zm3 7v2a3 3 0 0 0 3 3h3v-2H9a1 1 0 0 1-1-1v-2H6z" />'
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
    body: '<path d="M4 7h16M9 22v-7l-4-5V7m10 15v-7l4-5V7M9 7V2m6 5V2" /><rect x="9" y="11" width="6" height="4" rx="2" />'
  },
  'gbt': {
    viewBox: "0 0 64 64",
    ...defaultOutline,
    body: '<path d="M 14.7 10 L 49.3 10 A 28 28 0 1 1 14.7 10 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" /><circle cx="32" cy="27" r="5" fill="none" stroke="currentColor" stroke-width="3" /><circle cx="16" cy="27" r="5" fill="none" stroke="currentColor" stroke-width="3" /><circle cx="48" cy="27" r="5" fill="none" stroke="currentColor" stroke-width="3" /><circle cx="24" cy="42" r="5" fill="none" stroke="currentColor" stroke-width="3" /><circle cx="40" cy="42" r="5" fill="none" stroke="currentColor" stroke-width="3" /><circle cx="26" cy="15" r="2" fill="currentColor" stroke="none" /><circle cx="38" cy="15" r="2" fill="currentColor" stroke="none" />'
  },
  'ccs2': {
    viewBox: "0 0 64 64",
    ...defaultOutline,
    body: '<path fill="none" stroke="currentColor" stroke-width="3" d="M 21.8 6 L 42.2 6 A 19 19 0 0 1 49.2 30 A 21 21 0 1 1 14.8 30 A 19 19 0 0 1 21.8 6 Z" /><path fill="currentColor" fill-rule="evenodd" d="M 22.7 9 L 41.3 9 A 16 16 0 0 1 45.6 30.3 A 18 18 0 1 1 18.4 30.3 A 16 16 0 0 1 22.7 9 Z M 32 20.3 A 3.2 3.2 0 1 0 32 26.7 A 3.2 3.2 0 1 0 32 20.3 Z M 22 17.3 A 3.2 3.2 0 1 0 22 23.7 A 3.2 3.2 0 1 0 22 17.3 Z M 42 17.3 A 3.2 3.2 0 1 0 42 23.7 A 3.2 3.2 0 1 0 42 17.3 Z M 25 25.8 A 3.2 3.2 0 1 0 25 32.2 A 3.2 3.2 0 1 0 25 25.8 Z M 39 25.8 A 3.2 3.2 0 1 0 39 32.2 A 3.2 3.2 0 1 0 39 25.8 Z M 27 11.9 A 1.6 1.6 0 1 0 27 15.1 A 1.6 1.6 0 1 0 27 11.9 Z M 37 11.9 A 1.6 1.6 0 1 0 37 15.1 A 1.6 1.6 0 1 0 37 11.9 Z M 21 39.5 A 5.5 5.5 0 1 0 21 50.5 A 5.5 5.5 0 1 0 21 39.5 Z M 43 39.5 A 5.5 5.5 0 1 0 43 50.5 A 5.5 5.5 0 1 0 43 39.5 Z" stroke="none" /><circle cx="21" cy="45" r="1.5" fill="currentColor" stroke="none" /><circle cx="43" cy="45" r="1.5" fill="currentColor" stroke="none" />'
  },
  'info': {
    viewBox: "0 0 64 64",
    ...defaultFill,
    body: '<circle cx="32" cy="32" r="32" /><rect x="29" y="16" width="6" height="6" rx="1" fill="white" /><rect x="29" y="26" width="6" height="22" rx="1" fill="white" />'
  },
  'phone': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />'
  },
  'telegram': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />'
  },
  'messenger': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />'
  },
  'create': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />'
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
