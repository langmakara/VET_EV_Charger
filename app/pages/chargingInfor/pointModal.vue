<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { IonModal } from '@ionic/vue'
  import { useMembershipInfoQuery } from '~/composables/queries'
  import { usePointLabelsMutation } from '~/composables/queries/useLabel'
  import type { MembershipInfoData, LabelPointData } from '~/api/types'

  export interface PointPreset {
    id?: number
    kwh: number
    points: number
    labelKwh?: string
    labelPoints?: string
  }

  const props = withDefaults(
    defineProps<{
      isOpen?: boolean
      currentPoints?: number
      selectedPoints?: number
      presets?: PointPreset[]
    }>(),
    {
      isOpen: false,
      currentPoints: 0,
      selectedPoints: 0,
      presets: undefined
    }
  )

  const { data: membershipInfo, isLoading, isError, error } = useMembershipInfoQuery()

  const membership = computed<MembershipInfoData | null>(() => {
    const res: any = membershipInfo.value
    return res?.data ?? res?.body?.data ?? null
  })

  const currentMembershipPoints = computed(() => {
    return membership.value?.currentPoint ?? props.currentPoints ?? 0
  })

  // Dynamic point labels from usePointLabelsMutation
  const pointLabelsMutation = usePointLabelsMutation()
  const dynamicPresets = ref<PointPreset[]>([])
  const isFetchingPointLabels = computed(() => pointLabelsMutation.isPending.value)
  let hasFetchedPointLabels = false

  const fetchPointPresets = async (force = false) => {
    if (!force && (hasFetchedPointLabels || pointLabelsMutation.isPending.value)) {
      return
    }
    hasFetchedPointLabels = true

    try {
      const res = await pointLabelsMutation.mutateAsync({})
      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      const data: LabelPointData[] | undefined =
        (res as any)?.data ?? res?.body?.data ?? (res as any)?.body

      if (isSuccess !== false && Array.isArray(data) && data.length > 0) {
        dynamicPresets.value = data.map((item) => {
          const parsedKwh = parseFloat(String(item.name || '').replace(/[^0-9.]/g, '')) || 0
          return {
            id: item.id,
            kwh: parsedKwh,
            points: Number(item.point ?? 0),
            labelKwh: item.name || `${parsedKwh} kWh`,
            labelPoints: `${formatNumber(Number(item.point ?? 0))} Points`
          }
        })

        if (!props.selectedPoints && !activePoints.value && dynamicPresets.value[0]) {
          activePoints.value = dynamicPresets.value[0].points
          inputPoints.value = String(activePoints.value)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch point labels:', err)
      hasFetchedPointLabels = false
    }
  }

  const activePresets = computed<PointPreset[]>(() => {
    if (props.presets && props.presets.length > 0) {
      return props.presets
    }
    return dynamicPresets.value
  })

  onMounted(() => {
    fetchPointPresets()
  })

  const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void
    (e: 'close'): void
    (e: 'didDismiss'): void
    (e: 'cancel'): void
    (e: 'select', preset: PointPreset): void
    (e: 'apply', payload: { points: number; kwh: number }): void
  }>()

  // Active selected points and custom input
  const activePoints = ref<number>(props.selectedPoints || 0)
  const inputPoints = ref<string>(props.selectedPoints ? String(props.selectedPoints) : '')

  // Synchronize state when modal opens
  watch(
    () => props.isOpen,
    (open) => {
      if (open) {
        fetchPointPresets()
        if (props.selectedPoints && props.selectedPoints > 0) {
          activePoints.value = props.selectedPoints
          inputPoints.value = String(props.selectedPoints)
        } else if (activePresets.value[0]) {
          activePoints.value = activePresets.value[0].points
          inputPoints.value = String(activePoints.value)
        } else {
          activePoints.value = 0
          inputPoints.value = ''
        }
      }
    },
    { immediate: true }
  )

  // Select preset card
  const handleSelectPreset = (preset: PointPreset) => {
    activePoints.value = preset.points
    inputPoints.value = String(preset.points)
    emit('select', preset)
  }

  // Handle manual input in the preferred amount field
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const rawValue = target.value.replace(/[^0-9]/g, '')
    inputPoints.value = rawValue
    const num = parseInt(rawValue, 10) || 0
    activePoints.value = num
  }

  // Format numbers with commas (e.g. 1000 -> 1,000)
  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString('en-US')
  }

  // Close and dismiss
  const handleClose = () => {
    emit('update:isOpen', false)
    emit('close')
  }

  const handleCancel = () => {
    emit('cancel')
    handleClose()
  }

  const handleDismiss = () => {
    emit('didDismiss')
    emit('update:isOpen', false)
    emit('close')
  }

  // Apply Points action
  const handleApply = () => {
    const pts = parseInt(inputPoints.value, 10) || activePoints.value || 0
    const matched = activePresets.value.find((p) => p.points === pts)
    const kwh = matched ? Number(matched.kwh) : pts / 100
    emit('apply', {
      points: pts,
      kwh
    })
    handleClose()
  }
</script>

<template>
  <ion-modal :is-open="isOpen" class="point-modal" @didDismiss="handleDismiss">
    <div class="point-modal-container">
      <!-- 1. Header: Title & Close Button -->
      <div class="modal-header">
        <h2 class="modal-title">Apply Point</h2>
        <button type="button" class="close-button" aria-label="Close" @click="handleClose">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- 2. Current Points Row -->
      <div class="current-points-row">
        <span class="current-label">{{ $t('chargingInfor.currentPoints') }}</span>
        <span class="current-value">{{ formatNumber(currentMembershipPoints) }} {{ $t('chargingInfor.points') }}</span>
      </div>

      <!-- 3. Choose amount Section -->
      <div class="section-block">
        <div class="section-label">{{ $t('chargingInfor.chooseAmount') }}</div>
        <div class="preset-grid">
          <button
            v-for="preset in activePresets"
            :key="preset.id ?? preset.kwh"
            type="button"
            class="preset-card"
            :class="{ 'is-active': activePoints === preset.points }"
            @click="handleSelectPreset(preset)"
          >
            <span class="preset-kwh">{{ preset.labelKwh || `${preset.kwh} kWh` }}</span>
            <span class="preset-points">{{ formatNumber(preset.points) }} {{ $t('chargingInfor.points') }}</span>
          </button>
        </div>
      </div>

      <!-- 4. Preferred Amount Input Box -->
      <!-- <div class="section-block">
        <label for="preferred-point-input" class="section-label">
          {{ $t('chargingInfor.orEnterPreferredAmount') }}
        </label>
        <div class="input-wrapper">
          <input
            id="preferred-point-input"
            type="text"
            inputmode="numeric"
            class="point-input"
            :placeholder="$t('chargingInfor.enter')"
            :value="inputPoints"
            @input="handleInput"
            @keyup.enter="handleApply"
          />
          <span class="input-suffix">{{ $t('chargingInfor.point') }}</span>
        </div>
        <div class="ratio-note">{{ $t('chargingInfor.pointRatio') }}</div>
      </div> -->

      <!-- 5. Action Buttons: Cancel & Apply -->
      <div class="modal-actions">
        <button type="button" class="action-btn btn-cancel" @click="handleCancel">{{ $t('common.cancel') }}</button>
        <button type="button" class="action-btn btn-apply" @click="handleApply">{{ $t('common.apply') }}</button>
      </div>
    </div>
  </ion-modal>
</template>

<style scoped>
  .point-modal-container {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 18px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* 1. Header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .modal-title {
    color: #1f2937;
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.2px;
  }

  .close-button {
    background: transparent;
    border: none;
    color: #4b5563;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .close-button:hover {
    background-color: #f3f4f6;
    color: #111827;
  }

  .close-button:active {
    background-color: #e5e7eb;
  }

  /* 2. Current Points Row */
  .current-points-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 10px;
  }

  .current-label {
    color: #4b5563;
    font-size: 14px;
    font-weight: 500;
  }

  .current-value {
    color: #1f2937;
    font-size: 14.5px;
    font-weight: 700;
  }

  /* 3. Section Blocks */
  .section-block {
    display: flex;
    flex-direction: column;
    margin-bottom: 14px;
  }

  .section-label {
    color: #64748b;
    font-size: 13.5px;
    font-weight: 500;
    margin-bottom: 10px;
  }

  /* Preset Cards Grid */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .preset-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 72px;
    border-radius: 10px;
    border: none;
    background-color: #f0f4f9;
    cursor: pointer;
    padding: 8px 6px;
    transition:
      background-color 0.15s ease,
      transform 0.1s ease;
    box-sizing: border-box;
  }

  .preset-card:active {
    transform: scale(0.97);
  }

  .preset-kwh {
    font-size: 16px;
    font-weight: 700;
    color: #1e2b4f;
    line-height: 1.2;
  }

  .preset-points {
    font-size: 11.5px;
    color: #596780;
    margin-top: 4px;
    line-height: 1.2;
  }

  /* Active Preset Card */
  .preset-card.is-active {
    background-color: #de5204;
  }

  .preset-card.is-active .preset-kwh {
    color: #ffffff;
  }

  .preset-card.is-active .preset-points {
    color: rgba(255, 255, 255, 0.95);
  }

  /* 4. Preferred Amount Input */
  .input-wrapper {
    display: flex;
    align-items: center;
    height: 46px;
    background-color: #ffffff;
    border: 1.5px solid #d8dee4;
    border-radius: 8px;
    padding: 0 14px;
    box-sizing: border-box;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .input-wrapper:focus-within {
    border-color: #de5204;
    box-shadow: 0 0 0 3px rgba(222, 82, 4, 0.12);
  }

  .point-input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: 15px;
    color: #1f2937;
    padding: 0;
  }

  .point-input::placeholder {
    color: #9ca3af;
  }

  .input-suffix {
    font-size: 15px;
    font-weight: 500;
    color: #334155;
    margin-left: 8px;
  }

  /* Ratio Note */
  .ratio-note {
    color: #de5204;
    font-size: 13px;
    font-weight: 500;
    margin-top: 8px;
    padding-left: 2px;
  }

  /* 5. Bottom Action Buttons */
  .modal-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
  }

  .action-btn {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      transform 0.1s ease;
  }

  .btn-cancel {
    background-color: #ffffff;
    border: 1.5px solid #d8dee4;
    color: #334155;
  }

  .btn-cancel:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }

  .btn-cancel:active {
    background-color: #f1f5f9;
  }

  .btn-apply {
    background-color: #de5204;
    border: none;
    color: #ffffff;
  }

  .btn-apply:hover {
    background-color: #d04b03;
  }

  .btn-apply:active {
    transform: scale(0.98);
    background-color: #be4402;
  }
</style>

<style>
  /* Global modal container overrides for centered presentation */
  ion-modal.point-modal {
    --width: 90%;
    --max-width: 360px;
    --height: auto;
    --border-radius: 18px;
    --background: transparent;
    --box-shadow: none;
  }

  ion-modal.point-modal::part(content) {
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }
</style>
