<template>
  <div
    v-if="!hidden"
    class="select-float-control"
    :class="{ 'is-disabled': disabled, 'is-readonly': readonly }"
  >
    <!-- Static label above field -->
    <span v-if="label" class="field-label" :style="labelColorStyle">
      {{ label
      }}<span v-if="required && !noShowStar" class="required-star" :style="requiredColorStyle"
        >*</span
      >
    </span>

    <!-- Select field wrapper -->
    <div
      :class="[
        'select-field-wrapper',
        {
          'has-error': errorMessage,
          'is-focused': isOpen,
          'has-value': hasValue,
          'is-disabled': disabled,
          'is-readonly': readonly
        }
      ]"
      @click="toggleDropdown"
      ref="wrapperRef"
    >
      <!-- Selected value display -->
      <div class="select-display">
        <!-- Multi-select chips -->
        <template v-if="isMulti && Array.isArray(selectedValue) && selectedValue.length">
          <div class="chips-container">
            <span v-for="(chip, idx) in selectedValue" :key="idx" class="select-chip">
              {{ chip.label }}
              <ion-icon
                v-if="!disabled && !readonly"
                :icon="closeCircleOutline"
                class="chip-remove"
                @click.stop="removeChip(idx)"
              />
            </span>
          </div>
        </template>

        <!-- Single value display -->
        <template v-else-if="!isMulti && selectedValue && !Array.isArray(selectedValue)">
          <span class="single-value">{{ selectedValue.label }}</span>
        </template>

        <!-- Placeholder -->
        <span v-else class="select-placeholder">
          {{ computedPlaceholder }}
        </span>

        <!-- Dropdown indicator -->
        <ion-icon
          :icon="isOpen ? chevronUpOutline : chevronDownOutline"
          class="dropdown-icon"
          :class="{ 'icon-active': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown panel -->
    <Teleport to="body">
      <div v-if="isOpen" class="select-dropdown-backdrop" @click="closeDropdown" />
      <Transition name="dropdown-fade">
        <div v-if="isOpen" class="select-dropdown" :style="dropdownStyle" ref="dropdownRef">
          <!-- Search input -->
          <!-- <div class="search-container">
            <ion-icon :icon="searchOutline" class="search-icon" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="`Search${label ? ' ' + label.toLowerCase() : ''}...`"
              @input="handleSearchInput"
              @keydown.escape="closeDropdown"
            />
            <ion-icon
              v-if="searchQuery"
              :icon="closeCircleOutline"
              class="search-clear"
              @click.stop="searchQuery = ''"
            />
          </div> -->

          <!-- Options list -->
          <div class="options-list" ref="optionsListRef">
            <!-- No-option / "All" option -->
            <div
              v-if="showNoOption"
              :class="[
                'option-item',
                { selected: isOptionSelected({ value: undefined, label: 'All' }) }
              ]"
              @click="selectOption({ value: undefined, label: 'All' })"
            >
              <span class="option-label">All</span>
              <ion-icon
                v-if="isOptionSelected({ value: undefined, label: 'All' })"
                :icon="checkmarkOutline"
                class="option-check"
              />
            </div>

            <!-- Filtered options -->
            <template v-if="filteredOptions.length">
              <div
                v-for="(opt, idx) in filteredOptions"
                :key="idx"
                :class="[
                  'option-item',
                  {
                    selected: isOptionSelected(opt),
                    disabled: opt.isDisabled
                  }
                ]"
                @click="!opt.isDisabled && selectOption(opt)"
              >
                <!-- Option text with search highlight -->
                <span
                  v-if="highlightSearch && searchQuery"
                  class="option-label"
                  v-html="highlightMatch(opt.label)"
                />
                <span v-else class="option-label">{{ opt.label }}</span>

                <!-- Selected check indicator -->
                <ion-icon
                  v-if="isOptionSelected(opt)"
                  :icon="checkmarkOutline"
                  class="option-check"
                />
              </div>
            </template>

            <!-- No results -->
            <div v-else class="no-results">
              <ion-icon :icon="searchOutline" class="no-results-icon" />
              <span>No options found</span>
            </div>
          </div>

          <!-- Loading overlay -->
          <div v-if="loading" class="loading-overlay">
            <ion-spinner name="crescent" class="loading-spinner" />
            <span>Loading...</span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Error message -->
    <Transition name="error-slide">
      <span v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
  import { IonIcon, IonSpinner } from '@ionic/vue'
  import {
    chevronDownOutline,
    chevronUpOutline,
    closeCircleOutline,
    searchOutline,
    checkmarkOutline
  } from 'ionicons/icons'

  // ── Types ──────────────────────────────────────────────────────────────
  export interface SelectOption {
    value: any
    label: string
    parentId?: any
    isDisabled?: boolean
    [key: string]: any
  }

  // ── Props ──────────────────────────────────────────────────────────────
  const props = withDefaults(
    defineProps<{
      /** v-model binding */
      modelValue?: SelectOption | SelectOption[] | any | null
      /** Label text (floating) */
      label?: string
      /** Mark field as required */
      required?: boolean
      /** Allow multiple selections */
      isMulti?: boolean
      /** Available options */
      options?: SelectOption[]
      /** Show an "All" option at the top */
      showNoOption?: boolean
      /** Highlight matching search text in options */
      highlightSearch?: boolean
      /** Placeholder text */
      placeholder?: string
      /** Show a loading state */
      loading?: boolean
      /** Disable the control */
      disabled?: boolean
      /** Read-only mode */
      readonly?: boolean
      /** Completely hide the control */
      hidden?: boolean
      /** Hide the required star */
      noShowStar?: boolean
      /** Prevent disabling parent options (chart-of-accounts behaviour) */
      isNotDisableOption?: boolean
      /** Custom label color */
      color?: string
      /** Custom required-star color */
      requiredColor?: string
      /** External error message override */
      error?: string
    }>(),
    {
      modelValue: null,
      label: '',
      required: false,
      isMulti: false,
      options: () => [],
      showNoOption: false,
      highlightSearch: true,
      placeholder: '',
      loading: false,
      disabled: false,
      readonly: false,
      hidden: false,
      noShowStar: false,
      isNotDisableOption: false,
      color: '',
      requiredColor: '',
      error: ''
    }
  )

  // ── Emits ──────────────────────────────────────────────────────────────
  const emit = defineEmits<{
    (e: 'update:modelValue', value: SelectOption | SelectOption[] | null | undefined): void
    (e: 'change', value: SelectOption | SelectOption[] | null | undefined): void
    (e: 'inputChange', value: string): void
  }>()

  // ── Refs ───────────────────────────────────────────────────────────────
  const wrapperRef = ref<HTMLElement | null>(null)
  const dropdownRef = ref<HTMLElement | null>(null)
  const searchInputRef = ref<HTMLInputElement | null>(null)
  const optionsListRef = ref<HTMLElement | null>(null)

  const isOpen = ref(false)
  const searchQuery = ref('')
  const isTouched = ref(false)
  const dropdownStyle = ref<Record<string, string>>({})

  // ── Computed: Process options with disabled logic ──────────────────────
  const processedOptions = computed<SelectOption[]>(() => {
    const opts = props.options
    if (!Array.isArray(opts)) return []

    if (props.isNotDisableOption) return opts

    // If no option has parentId, return as-is
    if (!opts.some((item) => item.parentId)) return opts

    // Chart-of-accounts logic: disable parent options that have children
    return opts.map((item) => {
      const hasChildren = opts.some((account) => account.parentId === item.value)
      if (item.value === undefined && item.label === 'All') {
        return { ...item, isDisabled: false }
      }
      return { ...item, isDisabled: hasChildren }
    })
  })

  // ── Computed: Filtered options based on search ────────────────────────
  const filteredOptions = computed<SelectOption[]>(() => {
    if (!searchQuery.value) return processedOptions.value
    const query = searchQuery.value.trim().toLowerCase()
    return processedOptions.value.filter((opt) => String(opt.label).toLowerCase().includes(query))
  })

  // ── Computed: Resolve selected value (mirrors getSelectValue from JSX)
  const selectedValue = computed<SelectOption | SelectOption[] | null>(() => {
    const val = props.modelValue
    const opts = processedOptions.value

    if (props.isMulti) {
      const valueArray = Array.isArray(val) ? val : val ? [val] : []
      return valueArray.map((v: any) => {
        const matched = opts.find(
          (opt) =>
            Number(opt.value) === Number(v?.value ?? v) ||
            String(opt.label).trim().toLowerCase() ===
              String(v?.label ?? v?.value ?? v)
                .trim()
                .toLowerCase()
        )
        return matched || (typeof v === 'object' ? v : { value: v, label: String(v) })
      })
    }

    if (val === null || val === undefined || val === '') return null

    // If an empty array is passed to single-select, it has no value
    if (Array.isArray(val)) {
      if (val.length === 0) return null
      const first = val[0]
      const rawFirst = typeof first === 'object' && first !== null ? first.value ?? first : first
      const matched = opts.find(
        (opt) =>
          opt.value === rawFirst ||
          String(opt.value) === String(rawFirst) ||
          String(opt.label).trim().toLowerCase() === String(rawFirst).trim().toLowerCase()
      )
      return matched || (typeof first === 'object' ? first : { value: first, label: String(first) })
    }

    const rawVal = typeof val === 'object' && val !== null ? (val as any).value : val

    if (opts.length) {
      const selected = opts.find(
        (item) =>
          item?.value === rawVal ||
          String(item?.value) === String(rawVal) ||
          String(item?.label).trim().toLowerCase() === String(rawVal ?? '').trim().toLowerCase()
      )
      if (selected) return selected
    }

    if (typeof val === 'object' && val !== null && 'label' in (val as any)) {
      return val as SelectOption
    }

    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      return { value: rawVal, label: String(rawVal) }
    }

    return null
  })

  // ── Computed: Has value ───────────────────────────────────────────────
  const hasValue = computed(() => {
    if (props.isMulti) {
      return Array.isArray(selectedValue.value) && selectedValue.value.length > 0
    }
    return (
      selectedValue.value !== null &&
      selectedValue.value !== undefined &&
      !Array.isArray(selectedValue.value) &&
      Boolean(selectedValue.value.label !== undefined || selectedValue.value.value !== undefined)
    )
  })

  // ── Computed: Placeholder ─────────────────────────────────────────────
  const computedPlaceholder = computed(() => {
    if (props.disabled || props.readonly) return ''
    if (props.loading) return 'Loading...'
    return props.placeholder || 'Select'
  })

  // ── Computed: Validation error message ────────────────────────────────
  const errorMessage = computed(() => {
    if (props.error) return props.error
    if (!isTouched.value) return ''
    if (props.required && !hasValue.value) {
      return `${props.label || 'Select'} is required`
    }
    return ''
  })

  // ── Computed: Custom label color styling ──────────────────────────────
  const labelColorStyle = computed(() => {
    if (!props.color) return {}
    return { color: props.color }
  })

  const requiredColorStyle = computed(() => {
    if (!props.requiredColor) return {}
    return { color: props.requiredColor }
  })

  // ── Methods ───────────────────────────────────────────────────────────
  function toggleDropdown() {
    if (props.disabled || props.readonly) return
    if (isOpen.value) {
      closeDropdown()
    } else {
      openDropdown()
    }
  }

  function openDropdown() {
    if (props.disabled || props.readonly) return
    isOpen.value = true
    searchQuery.value = ''
    isTouched.value = true

    nextTick(() => {
      positionDropdown()
      searchInputRef.value?.focus()
    })
  }

  function closeDropdown() {
    isOpen.value = false
    searchQuery.value = ''
  }

  function positionDropdown() {
    if (!wrapperRef.value) return
    const rect = wrapperRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // Check if inside an ion-modal, modal-wrapper, or ion-content
    const modalEl = wrapperRef.value.closest('ion-modal, .modal-wrapper, ion-content')
    const modalRect = modalEl?.getBoundingClientRect()
    const containerTop = modalRect ? Math.max(0, modalRect.top) : 0
    const containerBottom = modalRect ? Math.min(viewportHeight, modalRect.bottom) : viewportHeight

    const spaceBelow = containerBottom - rect.bottom
    const spaceAbove = rect.top - containerTop

    // Estimate needed dropdown height based on options count
    const itemCount = (props.options?.length || 0) + (props.showNoOption ? 1 : 0)
    const estimatedHeight = Math.min(300, Math.max(80, itemCount * 44 + 16))

    // Prefer opening below unless there isn't enough room below and there IS more room above
    const openBelow = spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove

    if (openBelow) {
      // Open below
      dropdownStyle.value = {
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${Math.min(300, Math.max(100, spaceBelow - 8))}px`,
        zIndex: '99999'
      }
    } else {
      // Open above
      dropdownStyle.value = {
        position: 'fixed',
        bottom: `${viewportHeight - rect.top + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${Math.min(300, Math.max(100, spaceAbove - 8))}px`,
        zIndex: '99999'
      }
    }
  }

  function isOptionSelected(opt: SelectOption): boolean {
    if (props.isMulti) {
      const vals = Array.isArray(selectedValue.value) ? selectedValue.value : []
      return vals.some(
        (v) =>
          Number(v.value) === Number(opt.value) ||
          String(v.label).trim().toLowerCase() === String(opt.label).trim().toLowerCase()
      )
    }
    const sv = selectedValue.value as SelectOption | null
    if (!sv) return false
    return sv.value === opt.value
  }

  function selectOption(opt: SelectOption) {
    if (props.isMulti) {
      const currentVals = Array.isArray(selectedValue.value) ? [...selectedValue.value] : []
      const existingIdx = currentVals.findIndex(
        (v) =>
          Number(v.value) === Number(opt.value) ||
          String(v.label).trim().toLowerCase() === String(opt.label).trim().toLowerCase()
      )

      let newVal: SelectOption[]
      if (existingIdx >= 0) {
        // Deselect
        currentVals.splice(existingIdx, 1)
        newVal = currentVals
      } else {
        // Select
        newVal = [...currentVals, opt]
      }
      emit('update:modelValue', newVal)
      emit('change', newVal)
    } else {
      // For "All" / no-option
      if (opt.value === undefined) {
        emit('update:modelValue', undefined)
        emit('change', undefined)
      } else {
        emit('update:modelValue', opt)
        emit('change', opt)
      }
      closeDropdown()
    }
  }

  function removeChip(idx: number) {
    if (!Array.isArray(selectedValue.value)) return
    const newVal = [...selectedValue.value]
    newVal.splice(idx, 1)
    emit('update:modelValue', newVal)
    emit('change', newVal)
  }

  function handleSearchInput() {
    emit('inputChange', searchQuery.value)
  }

  function highlightMatch(text: string): string {
    if (!searchQuery.value) return text
    const query = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${query})`, 'gi')
    return String(text).replace(regex, '<mark class="search-highlight">$1</mark>')
  }

  // ── Click outside handler ─────────────────────────────────────────────
  function onClickOutside(e: MouseEvent) {
    if (
      wrapperRef.value &&
      !wrapperRef.value.contains(e.target as Node) &&
      dropdownRef.value &&
      !dropdownRef.value.contains(e.target as Node)
    ) {
      closeDropdown()
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────
  onMounted(() => {
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('resize', positionDropdown)
    window.addEventListener('scroll', positionDropdown, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onClickOutside)
    window.removeEventListener('resize', positionDropdown)
    window.removeEventListener('scroll', positionDropdown, true)
  })

  // Reposition on scroll inside ion-content
  watch(isOpen, (val) => {
    if (val) {
      nextTick(() => positionDropdown())
    }
  })
</script>

<style scoped>
  /* ── Root container ──────────────────────────────────────────────────── */
  .select-float-control {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    margin: var(--ion-padding, 16px) 0;
    font-family: inherit;
  }

  /* ── Static label (matches AppSelect / AppInputField) ────────────────── */
  .field-label {
    font-size: var(--app-font-size-normal, 14px);
    font-weight: 500;
    color: var(--app-color-text-primary, #1a1a1a);
  }

  .required-star {
    color: var(--ion-color-danger, #eb445a);
    margin-left: 2px;
  }

  /* ── Field wrapper ───────────────────────────────────────────────────── */
  .select-field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 48px;
    background: #ffffff;
    border: 1px solid var(--app-color-border, #ececec);
    border-radius: 10px;
    padding: 0 var(--ion-padding, 16px);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .select-field-wrapper:hover:not(.is-disabled):not(.is-readonly) {
    border-color: var(--app-color-text-muted, #b5b5b5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .select-field-wrapper.is-focused {
    border-color: var(--ion-color-primary, #de5d0a);
  }

  .select-field-wrapper.has-error {
    border-color: var(--ion-color-danger, #eb445a) !important;
  }

  .select-field-wrapper.is-disabled {
    opacity: 1;
    pointer-events: none;
    background: #ffffff;
  }

  .select-field-wrapper.is-readonly {
    pointer-events: none;
    background: #fafafa;
  }

  /* ── Select display ──────────────────────────────────────────────────── */
  .select-display {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 24px;
    gap: 8px;
  }

  .single-value {
    flex: 1;
    font-size: var(--app-font-size-normal, 14px);
    color: var(--app-color-text-primary, #1a1a1a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .select-placeholder {
    flex: 1;
    font-size: var(--app-font-size-normal, 14px);
    color: var(--app-color-text-muted, #b5b5b5);
  }


  /* ── Chips (multi-select) ────────────────────────────────────────────── */
  .chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
  }

  .select-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: linear-gradient(135deg, rgba(222, 93, 10, 0.1), rgba(222, 93, 10, 0.05));
    color: var(--ion-color-primary-shade, #c45209);
    border: 1px solid rgba(222, 93, 10, 0.2);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    transition: all 0.15s ease;
  }

  .select-chip:hover {
    background: linear-gradient(135deg, rgba(222, 93, 10, 0.15), rgba(222, 93, 10, 0.1));
  }

  .chip-remove {
    font-size: 14px;
    color: var(--ion-color-primary, #de5d0a);
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s ease;
  }

  .chip-remove:hover {
    opacity: 1;
  }

  /* ── Dropdown icon ───────────────────────────────────────────────────── */
  .dropdown-icon {
    font-size: 18px;
    color: var(--app-color-text-secondary, #8a8a8a);
    flex-shrink: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dropdown-icon.icon-active {
    color: var(--ion-color-primary, #de5d0a);
  }

  /* ── Dropdown backdrop ───────────────────────────────────────────────── */
  .select-dropdown-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99998;
    background: transparent;
  }

  /* ── Dropdown panel ──────────────────────────────────────────────────── */
  .select-dropdown {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid var(--app-color-border, #ececec);
    border-radius: 12px;
    box-shadow:
      0 8px 30px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    z-index: 99999;
  }

  /* ── Search container ────────────────────────────────────────────────── */
  .search-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--app-color-border, #ececec);
    background: #fafafa;
  }

  .search-icon {
    font-size: 18px;
    color: var(--app-color-text-muted, #b5b5b5);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: var(--app-color-text-primary, #1a1a1a);
    font-family: inherit;
  }

  .search-input::placeholder {
    color: var(--app-color-text-muted, #b5b5b5);
  }

  .search-clear {
    font-size: 18px;
    color: var(--app-color-text-muted, #b5b5b5);
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.15s ease;
  }

  .search-clear:hover {
    color: var(--app-color-text-secondary, #8a8a8a);
  }

  /* ── Options list ────────────────────────────────────────────────────── */
  .options-list {
    overflow-y: auto;
    max-height: 220px;
    padding: 4px 0;
    -webkit-overflow-scrolling: touch;
  }

  .options-list::-webkit-scrollbar {
    width: 4px;
  }

  .options-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .options-list::-webkit-scrollbar-thumb {
    background: var(--app-color-border, #ececec);
    border-radius: 4px;
  }

  .options-list::-webkit-scrollbar-thumb:hover {
    background: var(--app-color-text-muted, #b5b5b5);
  }

  /* ── Option item ─────────────────────────────────────────────────────── */
  .option-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 14px;
    color: var(--app-color-text-primary, #1a1a1a);
  }

  .option-item:hover:not(.disabled) {
    background: rgba(222, 93, 10, 0.05);
  }

  .option-item.selected {
    background: rgba(222, 93, 10, 0.08);
    font-weight: 500;
  }

  .option-item.selected:hover {
    background: rgba(222, 93, 10, 0.12);
  }

  .option-item.disabled {
    opacity: 0.45;
    cursor: not-allowed;
    color: var(--app-color-text-muted, #b5b5b5);
  }

  .option-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .option-check {
    font-size: 18px;
    color: var(--ion-color-primary, #de5d0a);
    flex-shrink: 0;
  }

  /* ── Multi-select checkbox ───────────────────────────────────────────── */
  .option-checkbox {
    flex-shrink: 0;
  }

  .checkbox-box {
    width: 18px;
    height: 18px;
    border: 1.5px solid var(--app-color-border, #ececec);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .checkbox-box.checked {
    background: var(--ion-color-primary, #de5d0a);
    border-color: var(--ion-color-primary, #de5d0a);
  }

  .checkbox-icon {
    font-size: 12px;
    color: #ffffff;
  }

  /* ── Search highlight ────────────────────────────────────────────────── */
  :deep(.search-highlight) {
    background: rgba(222, 93, 10, 0.15);
    color: var(--ion-color-primary-shade, #c45209);
    padding: 0 1px;
    border-radius: 2px;
    font-weight: 600;
  }

  /* ── No results ──────────────────────────────────────────────────────── */
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 14px;
    color: var(--app-color-text-muted, #b5b5b5);
    font-size: 13px;
  }

  .no-results-icon {
    font-size: 24px;
    opacity: 0.5;
  }

  /* ── Loading overlay ─────────────────────────────────────────────────── */
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(2px);
    font-size: 13px;
    color: var(--app-color-text-secondary, #8a8a8a);
    border-radius: 12px;
  }

  .loading-spinner {
    --color: var(--ion-color-primary, #de5d0a);
    width: 24px;
    height: 24px;
  }

  /* ── Error message ───────────────────────────────────────────────────── */
  .error-message {
    display: block;
    margin-top: 6px;
    padding-left: 4px;
    font-size: 12px;
    color: var(--ion-color-danger, #eb445a);
    font-weight: 500;
  }

  /* ── Transition: Dropdown ────────────────────────────────────────────── */
  .dropdown-fade-enter-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dropdown-fade-leave-active {
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dropdown-fade-enter-from {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }

  .dropdown-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(0.99);
  }

  /* ── Transition: Error message ───────────────────────────────────────── */
  .error-slide-enter-active {
    transition: all 0.2s ease;
  }

  .error-slide-leave-active {
    transition: all 0.15s ease;
  }

  .error-slide-enter-from {
    opacity: 0;
    transform: translateY(-4px);
  }

  .error-slide-leave-to {
    opacity: 0;
    transform: translateY(-2px);
  }
</style>
