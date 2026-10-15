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
    viewBox: "0 0 256 256",
    fill: "none",
    body: '<g> <path d="M128,0 C57.307,0 0,57.307 0,128 L0,128 C0,198.693 57.307,256 128,256 L128,256 C198.693,256 256,198.693 256,128 L256,128 C256,57.307 198.693,0 128,0 L128,0 Z" fill="#40B3E0"> </path> <path d="M190.2826,73.6308 L167.4206,188.8978 C167.4206,188.8978 164.2236,196.8918 155.4306,193.0548 L102.6726,152.6068 L83.4886,143.3348 L51.1946,132.4628 C51.1946,132.4628 46.2386,130.7048 45.7586,126.8678 C45.2796,123.0308 51.3546,120.9528 51.3546,120.9528 L179.7306,70.5928 C179.7306,70.5928 190.2826,65.9568 190.2826,73.6308" fill="#FFFFFF"> </path> <path d="M98.6178,187.6035 C98.6178,187.6035 97.0778,187.4595 95.1588,181.3835 C93.2408,175.3085 83.4888,143.3345 83.4888,143.3345 L161.0258,94.0945 C161.0258,94.0945 165.5028,91.3765 165.3428,94.0945 C165.3428,94.0945 166.1418,94.5735 163.7438,96.8115 C161.3458,99.0505 102.8328,151.6475 102.8328,151.6475" fill="#D2E5F1"> </path> <path d="M122.9015,168.1154 L102.0335,187.1414 C102.0335,187.1414 100.4025,188.3794 98.6175,187.6034 L102.6135,152.2624" fill="#B5CFE4"> </path> </g>'
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
  },
  'user-plus': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />'
  },
  'receipt-check': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M8 2 h8 a2 2 0 0 1 2 2 v16 l-3 -3 l-3 3 l-3 -3 l-3 3 v-16 a2 2 0 0 1 2 -2 Z" /><path d="M9 12 l2.5 2.5 l5 -5" />'
  },
  'credit-card-plus': {
    viewBox: "0 0 22 18",
    fill: "none",
    stroke: "white",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    body: '<path d="M18 17V11M15 14H21M21 6H1M21 8V4.2C21 3.0799 21 2.51984 20.782 2.09202C20.5903 1.7157 20.2843 1.40974 19.908 1.21799C19.4802 1 18.9201 1 17.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.7157 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V11.8C1 12.9201 1 13.4802 1.21799 13.908C1.40973 14.2843 1.71569 14.5903 2.09202 14.782C2.51984 15 3.0799 15 4.2 15H11" />'
  },
  'credit-card-minus': {
    viewBox: "0 0 22 16",
    fill: "none",
    stroke: "white",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    body: '<path d="M15 14H21M21 6H1M21 9.5V4.2C21 3.0799 21 2.51984 20.782 2.09202C20.5903 1.7157 20.2843 1.40974 19.908 1.21799C19.4802 1 18.9201 1 17.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.7157 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V11.8C1 12.9201 1 13.4802 1.21799 13.908C1.40973 14.2843 1.71569 14.5903 2.09202 14.782C2.51984 15 3.0799 15 4.2 15H11" />'
  },
  'history-check': {
    viewBox: "0 0 16 17",
    ...defaultOutline,
    body: '<path d="M5.16667 7.25L6.83333 8.91667L10.5833 5.16667M14.3333 16V5C14.3333 3.59987 14.3333 2.8998 14.0608 2.36502C13.8212 1.89462 13.4387 1.51217 12.9683 1.27248C12.4335 1 11.7335 1 10.3333 1H5C3.59987 1 2.8998 1 2.36502 1.27248C1.89462 1.51217 1.51217 1.89462 1.27248 2.36502C1 2.8998 1 3.59987 1 5V16L3.29167 14.3333L5.375 16L7.66667 14.3333L9.95833 16L12.0417 14.3333L14.3333 16Z" />'
  },
  'navigate': {
    viewBox: "0 0 24 24",
    ...defaultFill,
    body: '<path d="M12 2L19.07 19.07L12 15.93L4.93 19.07L12 2Z" />'
  },
  'scan': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="3" y1="12" x2="21" y2="12" />'
  },
  'qr-code': {
    viewBox: "0 0 40 40",
    ...defaultFill,
    body: '<path d="M4.61732 16.6668C3.90065 16.6668 3.33398 16.1002 3.33398 15.3835V11.5335C3.33398 7.01683 7.01732 3.3335 11.534 3.3335H15.384C16.1006 3.3335 16.6673 3.90016 16.6673 4.61683C16.6673 5.3335 16.1006 5.90016 15.384 5.90016H11.534C8.41732 5.90016 5.90065 8.4335 5.90065 11.5335V15.3835C5.90065 16.1002 5.31732 16.6668 4.61732 16.6668Z" fill="currentColor"/><path d="M35.384 16.6668C34.684 16.6668 34.1006 16.1002 34.1006 15.3835V11.5335C34.1006 8.41683 31.5673 5.90016 28.4673 5.90016H24.6173C23.9007 5.90016 23.334 5.31683 23.334 4.61683C23.334 3.91683 23.9007 3.3335 24.6173 3.3335H28.4673C32.984 3.3335 36.6673 7.01683 36.6673 11.5335V15.3835C36.6673 16.1002 36.1007 16.6668 35.384 16.6668Z" fill="currentColor"/><path d="M28.4672 36.6666H26.1505C25.4505 36.6666 24.8672 36.1 24.8672 35.3833C24.8672 34.6833 25.4339 34.1 26.1505 34.1H28.4672C31.5839 34.1 34.1005 31.5666 34.1005 28.4666V26.1666C34.1005 25.4666 34.6672 24.8833 35.3839 24.8833C36.0839 24.8833 36.6672 25.45 36.6672 26.1666V28.4666C36.6672 32.9833 32.9839 36.6666 28.4672 36.6666Z" fill="currentColor"/><path d="M15.384 36.6668H11.534C7.01732 36.6668 3.33398 32.9835 3.33398 28.4668V24.6168C3.33398 23.9002 3.90065 23.3335 4.61732 23.3335C5.33398 23.3335 5.90065 23.9002 5.90065 24.6168V28.4668C5.90065 31.5835 8.43398 34.1002 11.534 34.1002H15.384C16.084 34.1002 16.6673 34.6668 16.6673 35.3835C16.6673 36.1002 16.1006 36.6668 15.384 36.6668Z" fill="currentColor"/><path d="M30.7659 18.7168H28.4992H11.4992H9.23255C8.51589 18.7168 7.94922 19.3001 7.94922 20.0001C7.94922 20.7001 8.51589 21.2835 9.23255 21.2835H11.4992H28.4992H30.7659C31.4825 21.2835 32.0492 20.7001 32.0492 20.0001C32.0492 19.3001 31.4825 18.7168 30.7659 18.7168Z" fill="currentColor"/><path d="M11.5 23.2333V23.7833C11.5 26.55 13.7333 28.7833 16.5 28.7833H23.5C26.2667 28.7833 28.5 26.55 28.5 23.7833V23.2333C28.5 23.0333 28.35 22.8833 28.15 22.8833H11.85C11.65 22.8833 11.5 23.0333 11.5 23.2333Z" fill="currentColor"/><path d="M11.5 16.7668V16.2168C11.5 13.4501 13.7333 11.2168 16.5 11.2168H23.5C26.2667 11.2168 28.5 13.4501 28.5 16.2168V16.7668C28.5 16.9668 28.35 17.1168 28.15 17.1168H11.85C11.65 17.1168 11.5 16.9668 11.5 16.7668Z" fill="currentColor"/>'
  },
  'point': {
    viewBox: "0 0 15 17",
    ...defaultOutline,
    strokeWidth: "1.5",
    body: '<path d="M14.25 3C14.25 4.24264 11.2279 5.25 7.5 5.25C3.77208 5.25 0.75 4.24264 0.75 3M14.25 3C14.25 1.75736 11.2279 0.75 7.5 0.75C3.77208 0.75 0.75 1.75736 0.75 3M14.25 3V13.5C14.25 14.745 11.25 15.75 7.5 15.75C3.75 15.75 0.75 14.745 0.75 13.5V3M14.25 6.54016C14.25 7.78516 11.25 8.79016 7.5 8.79016C3.75 8.79016 0.75 7.78516 0.75 6.54016M14.25 10.08C14.25 11.325 11.25 12.33 7.5 12.33C3.75 12.33 0.75 11.325 0.75 10.08" />'
  },
  'purchase': {
    viewBox: "0 0 17 12",
    ...defaultOutline,
    strokeWidth: "1.5",
    body: '<path d="M15.75 4.5H0.75M7.5 7.5H3.75M0.75 3.15L0.75 8.85C0.75 9.69008 0.75 10.1101 0.91349 10.431C1.0573 10.7132 1.28677 10.9427 1.56901 11.0865C1.88988 11.25 2.30992 11.25 3.15 11.25L13.35 11.25C14.1901 11.25 14.6101 11.25 14.931 11.0865C15.2132 10.9427 15.4427 10.7132 15.5865 10.431C15.75 10.1101 15.75 9.69008 15.75 8.85V3.15C15.75 2.30992 15.75 1.88988 15.5865 1.56902C15.4427 1.28677 15.2132 1.0573 14.931 0.913491C14.6101 0.750001 14.1901 0.750001 13.35 0.750001L3.15 0.75C2.30992 0.75 1.88988 0.75 1.56901 0.91349C1.28677 1.0573 1.0573 1.28677 0.91349 1.56901C0.75 1.88988 0.75 2.30992 0.75 3.15Z" />'
  },
  'info-circle': {
    viewBox: "0 0 24 24",
    ...defaultOutline,
    body: '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />'
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
