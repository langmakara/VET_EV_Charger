<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../Icon/icon.vue'

const props = defineProps({
  buttonType: { type: String, default: null },
  type: { type: String, default: 'button' },
  variant: { type: String, default: null }, // 'solid' | 'outline' | 'clear' | 'back-link' | 'badge-icon'
  colorScheme: { type: String, default: null }, // 'brand' | 'gray' | 'red' | 'green' | 'blue'
  color: { type: String, default: null }, // direct Ionic color, overrides colorScheme
  size: { type: String, default: null }, // 'sm' | 'md' | 'lg'
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
  filter: { icon: 'search', iconLabel: t('label.filter'), iconOnly: true },
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
  back: { variant: 'back-link' },
}))

const config = computed(() => configs.value[props.buttonType] || {})

// * Property resolution — props win over the buttonType config
const resolvedLabel = computed(() => props.label ?? config.value.label)
const resolvedIcon = computed(() => props.icon ?? config.value.icon)
const resolvedIconLabel = computed(() => props.iconLabel ?? config.value.iconLabel)
const resolvedLeftIcon = computed(() => props.leftIcon ?? (!props.rightIcon ? resolvedIcon.value : null))
const resolvedRightIcon = computed(() => props.rightIcon)

const isBackLink = computed(() => props.buttonType === 'back' || props.variant === 'back-link')
const isBadgeIcon = computed(() => props.buttonType === 'badge' || props.variant === 'badge-icon')
const isIconOnly = computed(() => props.isIconButton || !!config.value.iconOnly)

const colorSchemeMap = { brand: 'primary', gray: 'medium', red: 'danger', green: 'success', blue: 'tertiary' }
const sizeMap = { sm: 'small', md: 'default', lg: 'large' }
const variantFillMap = { solid: 'solid', outline: 'outline', clear: 'clear', unstyled: 'clear', ghost: 'clear' }

const resolvedColor = computed(() => props.color || colorSchemeMap[props.colorScheme || config.value.colorScheme] || 'primary')
const resolvedSize = computed(() => sizeMap[props.size] || 'default')
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
      :disabled="isDisabled || isLoading"
      :title="resolvedIconLabel"
      :aria-label="resolvedIconLabel"
      v-bind="$attrs"
      @click="onClick"
    >
      <ion-spinner v-if="isLoading" name="dots" slot="icon-only" />
      <Icon v-else :name="resolvedIcon" slot="icon-only" />
    </ion-button>

    <!-- standard button -->
    <ion-button
      v-else
      :type="type"
      :fill="resolvedFill"
      :color="resolvedColor"
      :size="resolvedSize"
      :expand="expand"
      :disabled="isDisabled || isLoading"
      v-bind="$attrs"
      @click="onClick"
    >
      <ion-spinner v-if="isLoading" name="dots" slot="start" />
      <Icon v-else-if="resolvedLeftIcon" :name="resolvedLeftIcon" slot="start" />
      <slot>{{ resolvedLabel }}</slot>
      <Icon v-if="resolvedRightIcon && !isLoading" :name="resolvedRightIcon" slot="end" />
    </ion-button>
  </template>
</template>


<style scoped>
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