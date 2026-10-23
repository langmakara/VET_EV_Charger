<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAssetResolver } from '~/composables/useAssetResolver'

interface Props {
  /**
   * Simulated duration in milliseconds (default: 5000 = 5 seconds)
   */
  duration?: number
  /**
   * Direct progress control (0 to 100).
   * When provided, automatic simulation is bypassed.
   */
  progress?: number | null
  /**
   * Status indicator: set to true when the API call succeeds.
   * Smoothly and rapidly animates the progress to 100% and triggers completion.
   */
  isLoaded?: boolean
  /**
   * Status text displayed below the progress bar
   */
  text?: string
  /**
   * Fullscreen fixed overlay or full-height container
   */
  fullscreen?: boolean
  /**
   * Automatically fade out and hide when reaching 100%
   */
  hideOnComplete?: boolean
  /**
   * Custom logo image source (defaults to VET logo)
   */
  logoSrc?: string
}

const props = withDefaults(defineProps<Props>(), {
  duration: 5000,
  progress: null,
  isLoaded: false,
  text: 'Downloading contents.......',
  fullscreen: true,
  hideOnComplete: true,
  logoSrc: ''
})

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'finish'): void
  (e: 'update:progress', value: number): void
}>()

const { resolveAsset } = useAssetResolver()

// Current internal progress (0 to 100)
const currentProgress = ref<number>(0)
const isVisible = ref<boolean>(true)
const isCompleted = ref<boolean>(false)

// Determine the logo URL
const fallbackLogo = resolveAsset('images/logo.svg')
const currentLogo = ref<string>(props.logoSrc || fallbackLogo)

const handleImageError = () => {
  // If svg fails or custom fails, fallback to jpg
  currentLogo.value = resolveAsset('images/logo.jpg')
}

// Timer and animation handling
let animationFrameId: number | null = null
let startTime: number | null = null

const startSimulatedProgress = () => {
  if (props.progress !== null) return

  startTime = null
  const totalDuration = props.duration || 5000

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const rawProgress = Math.min((elapsed / totalDuration) * 100, 100)

    currentProgress.value = Math.round(rawProgress * 10) / 10
    emit('update:progress', currentProgress.value)

    if (elapsed < totalDuration && !props.isLoaded) {
      animationFrameId = requestAnimationFrame(step)
    } else {
      triggerComplete()
    }
  }

  animationFrameId = requestAnimationFrame(step)
}

const stopAnimation = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

/**
 * Fast-finish transition: smoothly animates to 100% when API succeeds
 */
const fastFinish = () => {
  stopAnimation()
  if (currentProgress.value >= 100) {
    triggerComplete()
    return
  }

  const startVal = currentProgress.value
  const finishDuration = 300 // 300ms rapid fill to 100%
  let finishStartTime: number | null = null

  const finishStep = (timestamp: number) => {
    if (!finishStartTime) finishStartTime = timestamp
    const elapsed = timestamp - finishStartTime
    const progressFactor = Math.min(elapsed / finishDuration, 1)

    // Ease-out quad
    const eased = 1 - (1 - progressFactor) * (1 - progressFactor)
    currentProgress.value = Math.min(
      100,
      Math.round((startVal + (100 - startVal) * eased) * 10) / 10
    )
    emit('update:progress', currentProgress.value)

    if (elapsed < finishDuration) {
      animationFrameId = requestAnimationFrame(finishStep)
    } else {
      currentProgress.value = 100
      emit('update:progress', 100)
      triggerComplete()
    }
  }

  animationFrameId = requestAnimationFrame(finishStep)
}

const triggerComplete = () => {
  if (isCompleted.value) return
  isCompleted.value = true
  currentProgress.value = 100
  emit('update:progress', 100)

  // Allow 250ms for user to perceive 100% progress before initiating transition
  setTimeout(() => {
    if (props.hideOnComplete) {
      isVisible.value = false
      // Wait for the 350ms CSS fade-out transition to finish before emitting complete
      setTimeout(() => {
        emit('complete')
        emit('finish')
      }, 350)
    } else {
      emit('complete')
      emit('finish')
    }
  }, 250)
}

// Watch controlled progress
watch(
  () => props.progress,
  (val) => {
    if (val !== null && val !== undefined) {
      stopAnimation()
      currentProgress.value = Math.min(100, Math.max(0, val))
      if (currentProgress.value >= 100) {
        triggerComplete()
      }
    }
  }
)

// Watch API success flag (isLoaded)
watch(
  () => props.isLoaded,
  (loaded) => {
    if (loaded) {
      fastFinish()
    }
  }
)

watch(
  () => props.logoSrc,
  (newLogo) => {
    if (newLogo) currentLogo.value = newLogo
  }
)

onMounted(() => {
  if (props.progress !== null) {
    currentProgress.value = Math.min(100, Math.max(0, props.progress))
    if (currentProgress.value >= 100) {
      triggerComplete()
    }
  } else if (props.isLoaded) {
    fastFinish()
  } else {
    startSimulatedProgress()
  }
})

onBeforeUnmount(() => {
  stopAnimation()
})

// Expose methods for parent components
defineExpose({
  currentProgress,
  finish: fastFinish,
  start: startSimulatedProgress,
  reset: () => {
    stopAnimation()
    isCompleted.value = false
    isVisible.value = true
    currentProgress.value = 0
  },
  setProgress: (val: number) => {
    stopAnimation()
    currentProgress.value = Math.min(100, Math.max(0, val))
    if (currentProgress.value >= 100) {
      triggerComplete()
    }
  }
})
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="isVisible"
      class="loading-page-wrapper"
      :class="{ 'is-fullscreen': fullscreen }"
      role="status"
      aria-live="polite"
    >
      <div class="loading-content">
        <!-- Logo Emblem inside orange circle -->
        <div class="logo-circle-container">
          <div class="vet-circle-badge">
            <img
              :src="currentLogo"
              alt="VET Logo"
              class="vet-logo-img"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{ width: `${currentProgress}%` }"
          ></div>
        </div>

        <!-- Status text -->
        <p class="loading-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-page-wrapper {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  user-select: none;
}

.loading-page-wrapper.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 24px;
}

/* Logo Circle */
.logo-circle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.vet-circle-badge {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background-color: #e8590c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(232, 89, 12, 0.22);
  position: relative;
}

.vet-logo-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  display: block;
  /* Replicate crisp white outline around temple pillars and steps as in design */
  filter: drop-shadow(1px 0 0 #ffffff)
          drop-shadow(-1px 0 0 #ffffff)
          drop-shadow(0 1px 0 #ffffff)
          drop-shadow(0 -1px 0 #ffffff)
          drop-shadow(0 0 1px #ffffff);
}

/* Progress Bar */
.progress-bar-container {
  width: 72%;
  max-width: 280px;
  min-width: 200px;
  height: 4.5px;
  background-color: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 24px;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background-color: #22c55e;
  border-radius: 9999px;
  transition: width 0.12s linear;
  min-width: 0;
}

/* Status Text */
.loading-text {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
  margin: 0;
  text-align: center;
  letter-spacing: 0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Fade Transition */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.35s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
