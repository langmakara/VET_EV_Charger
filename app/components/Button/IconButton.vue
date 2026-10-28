<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../Icon/icon.vue'

const props = defineProps({
  buttonType: { type: String, default: null },
  name: { type: String, default: null },
  type: { type: String, default: 'button' },
  variant: { type: String, default: null }, // 'solid' | 'outline' | 'clear' | 'back-link' | 'badge-icon'
  colorScheme: { type: String, default: null }, // 'brand' | 'gray' | 'red' | 'green' | 'blue'
  color: { type: String, default: null }, // direct Ionic color, overrides colorScheme
  size: { type: String, default: null }, // button size fallback or custom CSS (e.g. 'sm', 'md', 'lg', '12px', '16px')
  buttonSize: { type: String, default: null }, // button dimensions (e.g. '48px', '60px', 'sm', 'md', 'lg')
  iconSize: { type: String, default: null }, // icon dimensions (e.g. '18px', '24px', '28px', 'sm', 'md', 'lg')
  shape: { type: String, default: null }, // 'round'
  rounded: { type: Boolean, default: false }, // if true, makes button circular (50% border-radius)
  icon: { type: [String, Object, Function], default: null },
  iconLabel: { type: String, default: null },
  leftIcon: { type: [String, Object, Function], default: null },
  rightIcon: { type: [String, Object, Function], default: null },
  isLoading: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  isIconButton: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  label: { type: String, default: null },
  count: { type: [String, Number], default: null },
  expand: { type: String, default: null }, // 'block' | 'full'
})

const emit = defineEmits(['click'])
const { t } = useI18n()

// * Predefined configurations — mirrors the React `configs` map 1:1
const configs = computed(() => ({
  add: { label: t('label.add') },
  'add-new': { label: t('label.add_new') },
  save: { label: t('label.save') },
  update: { label: t('label.update') },
  clone: { label: t('label.clone') },
  cancel: { label: t('label.cancel'), colorScheme: 'gray' },
  import: { label: t('label.import') },
  yes: { label: t('label.yes') },
  no: { label: t('label.no'), variant: 'outline', colorScheme: 'gray' },
  approve: { label: t('label.approve'), colorScheme: 'green' },
  reject: { label: t('label.reject'), colorScheme: 'red' },
  undo: { label: t('label.undo'), variant: 'outline', colorScheme: 'gray' },
  view: { icon: 'eye', iconLabel: t('label.view'), colorScheme: 'gray', iconOnly: true },
  edit: { icon: 'create', iconLabel: t('label.edit'), colorScheme: 'blue', iconOnly: true },
  delete: { icon: 'trash', iconLabel: t('label.delete'), colorScheme: 'red', iconOnly: true },
  reset: { icon: 'refresh', iconLabel: t('label.reset'), colorScheme: 'green', iconOnly: true },
  'clone-icon': { icon: 'copy', iconLabel: t('label.clone'), colorScheme: 'green', iconOnly: true },
  remove: { icon: 'remove-circle', iconLabel: t('label.remove'), colorScheme: 'red', iconOnly: true },
  pay: { icon: 'cash', iconLabel: t('label.pay_back'), colorScheme: 'green', iconOnly: true },
  upload: { icon: 'cloud-upload', iconLabel: t('label.upload'), colorScheme: 'gray', iconOnly: true },
  moreFilter: { icon: 'options', iconLabel: t('label.more_filter'), iconOnly: true },
  append: { icon: 'add-circle', iconLabel: t('label.append'), colorScheme: 'green', iconOnly: true },
  print: { icon: 'print', iconLabel: t('label.print'), colorScheme: 'blue', iconOnly: true },
  memo: { icon: 'document-text', iconLabel: props.iconLabel, colorScheme: 'blue', iconOnly: true },
  export: { icon: 'download', iconLabel: t('label.export'), colorScheme: 'green', iconOnly: true },
  'print-pdf': { icon: 'document', iconLabel: t('label.print_pdf'), colorScheme: 'red', iconOnly: true },
  reason: { icon: 'information-circle', iconLabel: t('label.reason'), colorScheme: 'green', iconOnly: true },
  review: { icon: 'eye', iconLabel: t('label.review'), colorScheme: 'blue', variant: 'clear', iconOnly: true },
  download: { icon: 'download', iconLabel: t('label.download'), colorScheme: 'gray', iconOnly: true },
  'upload-receipt': { icon: 'receipt', iconLabel: t('label.upload_receipt'), colorScheme: 'green', variant: 'clear', iconOnly: true },
  badge: { variant: 'badge-icon' },
  back: { icon: 'chevron-left', iconLabel: t('label.back'), variant: 'back-link' },
  direction: { icon: 'map', iconLabel: 'Direction', colorScheme: 'gray', iconOnly: true },
  map: { icon: 'map', iconLabel: 'Direction', colorScheme: 'gray', iconOnly: true },
  scan: { icon: 'scan', iconLabel: t('label.scan'), colorScheme: 'blue', iconOnly: true },
  'qr-code': { icon: 'qr-code', iconLabel: 'QR Code', colorScheme: 'gray', iconOnly: true },
  heart: { icon: 'heart', iconLabel: 'Favorite', colorScheme: 'brand', variant: 'clear', iconOnly: true },
  filter: { icon: 'filter', iconLabel: t('label.filter') || 'Filter', colorScheme: 'gray', iconOnly: true },
  close: { icon: 'close', iconLabel: 'Close', colorScheme: 'gray', variant: 'clear', iconOnly: true },
  flashlight: { icon: 'flashlight', iconLabel: 'Flashlight', colorScheme: 'gray', iconOnly: true },
}))

const config = computed(() => configs.value[props.buttonType || props.name || props.icon] || {})

// * Property resolution — props win over the buttonType config
const resolvedLabel = computed(() => props.label ?? config.value.label)
const resolvedIcon = computed(() => props.name ?? props.icon ?? config.value.icon)
const resolvedIconLabel = computed(() => props.iconLabel ?? config.value.iconLabel)
const resolvedLeftIcon = computed(() => props.leftIcon ?? (!props.rightIcon ? resolvedIcon.value : null))
const resolvedRightIcon = computed(() => props.rightIcon)

const isBackLink = computed(() => {
  if (props.variant === 'back-link') return true
  if (props.buttonType === 'back') {
    if (props.isIconButton || props.buttonSize || props.rounded || (props.variant && props.variant !== 'back-link')) return false
    return true
  }
  return false
})
const isBadgeIcon = computed(() => props.buttonType === 'badge' || props.variant === 'badge-icon')
const isIconOnly = computed(() => props.isIconButton || !!config.value.iconOnly || (!!resolvedIcon.value && !resolvedLabel.value && !props.leftIcon && !props.rightIcon))

const isCustomLength = (val) =>
  typeof val === 'string' &&
  (val.includes('px') || val.includes('em') || val.includes('rem') || val.includes('%'))

// Resolve Icon Size
const resolvedIconSize = computed(() => {
  if (props.iconSize) {
    if (props.iconSize === 'sm') return '14px'
    if (props.iconSize === 'md') return '18px'
    if (props.iconSize === 'lg') return '24px'
    return props.iconSize
  }
  // When buttonSize is specified without iconSize, fallback to clean icon defaults
  if (props.buttonSize) {
    if (props.buttonSize === 'sm') return '14px'
    if (props.buttonSize === 'lg') return '28px'
    return '24px'
  }
  // Backwards compatibility with props.size
  if (isCustomLength(props.size)) return props.size
  if (props.size === 'sm') return '14px'
  if (props.size === 'lg') return '24px'
  return undefined
})

const sizeMap = { sm: 'small', md: 'default', lg: 'large' }
const colorSchemeMap = { brand: 'primary', gray: 'medium', red: 'danger', green: 'success', blue: 'tertiary' }
const variantFillMap = { solid: 'solid', outline: 'outline', clear: 'clear', unstyled: 'clear', ghost: 'clear' }

// Resolve native Ionic button size
const resolvedSize = computed(() => {
  const s = props.buttonSize || props.size
  if (isCustomLength(s)) return 'small'
  return sizeMap[s] || 'default'
})

// Resolve explicit button dimensions (width/height)
const resolvedButtonDimension = computed(() => {
  if (props.buttonSize) {
    if (isCustomLength(props.buttonSize)) return props.buttonSize
    if (props.buttonSize === 'sm') return '32px'
    if (props.buttonSize === 'md') return '44px'
    if (props.buttonSize === 'lg') return '56px'
  }
  // Backwards compatibility: custom length in props.size when iconSize is not separate
  if (isCustomLength(props.size) && !props.iconSize) {
    return props.size
  }
  return null
})

const buttonCustomStyle = computed(() => {
  const styles = {}
  if (resolvedButtonDimension.value) {
    styles.width = resolvedButtonDimension.value
    styles.height = resolvedButtonDimension.value
    styles['--padding-start'] = '0px'
    styles['--padding-end'] = '0px'
    styles['--padding-top'] = '0px'
    styles['--padding-bottom'] = '0px'
    styles['min-height'] = 'unset'
  }
  if (props.rounded || props.shape === 'round') {
    styles['--border-radius'] = '50%'
    styles['border-radius'] = '50%'
  }
  return Object.keys(styles).length > 0 ? styles : null
})

const resolvedColor = computed(() => props.color || colorSchemeMap[props.colorScheme || config.value.colorScheme] || 'primary')
const resolvedFill = computed(() => variantFillMap[props.variant || config.value.variant] || 'solid')

function onClick(event) {
  if (props.isDisabled || props.isLoading) return
  emit('click', event)
}
</script>

<template>
  <template v-if="!hidden">
    <!-- back link -->
    <div v-if="isBackLink" class="app-btn-back" v-bind="$attrs" @click="onClick">
      <Icon name="arrow-back" class="app-btn-back__icon" />
      <span>{{ resolvedLabel || t('label.back') }}</span>
    </div>

    <!-- badge icon (icon + count bubble, no button chrome) -->
    <div v-else-if="isBadgeIcon" class="app-btn-badge" v-bind="$attrs" @click="onClick">
      <Icon :name="resolvedIcon" size="2em" />
      <ion-badge v-if="count" class="app-btn-badge__count" color="danger">{{ count }}</ion-badge>
    </div>

    <!-- icon-only button, optionally with a native tooltip via title -->
    <ion-button
      v-else-if="isIconOnly"
      :type="type"
      :fill="resolvedFill"
      :color="resolvedColor"
      :size="resolvedSize"
      :shape="shape"
      :disabled="isDisabled || isLoading"
      :title="resolvedIconLabel"
      :aria-label="resolvedIconLabel"
      class="app-btn-icon-only"
      :class="{ 'app-btn-icon-clear': resolvedFill === 'clear', 'app-btn-rounded': rounded || shape === 'round' }"
      :style="buttonCustomStyle"
      v-bind="$attrs"
      @click="onClick"
    >
      <ion-spinner v-if="isLoading" name="dots" slot="icon-only" />
      <Icon v-else :name="resolvedIcon" :size="resolvedIconSize" slot="icon-only" />
    </ion-button>

    <!-- standard button -->
    <ion-button
      v-else
      :type="type"
      :fill="resolvedFill"
      :color="resolvedColor"
      :size="resolvedSize"
      :shape="shape"
      :expand="expand"
      :disabled="isDisabled || isLoading"
      :style="buttonCustomStyle"
      v-bind="$attrs"
      @click="onClick"
    >
      <ion-spinner v-if="isLoading" name="dots" slot="start" />
      <Icon v-else-if="resolvedLeftIcon" :name="resolvedLeftIcon" :size="resolvedIconSize" slot="start" />
      <slot>{{ resolvedLabel }}</slot>
      <Icon v-if="resolvedRightIcon && !isLoading" :name="resolvedRightIcon" :size="resolvedIconSize" slot="end" />
    </ion-button>
  </template>
</template>


<style scoped>
ion-button {
  text-transform: none;
}
ion-button::part(native) {
  text-transform: none;
}
.app-btn-icon-only {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  margin: 0;
}
.app-btn-icon-only::part(native) {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-btn-rounded {
  --border-radius: 50%;
}
.app-btn-rounded::part(native) {
  border-radius: 50%;
}
.app-btn-icon-clear {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  margin: 0;
  min-height: unset;
}
.app-btn-icon-clear::part(native) {
  padding: 0;
}
.app-btn-back {
  display: inline-flex;
  align-items: center;
  min-width: 100px;
  font-weight: 500;
  cursor: pointer;
}
.app-btn-back__icon {
  margin-right: 4px;
  font-size: 1.25em;
}
.app-btn-badge {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}
.app-btn-badge__count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.7em;
}
</style>