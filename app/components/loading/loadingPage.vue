<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { IonIcon } from '@ionic/vue'
import { codeWorkingOutline } from 'ionicons/icons'
import { useAssetResolver } from '~/composables/useAssetResolver'
import { useSendProfile, getIsNewAbaUser } from '~/composables/useSendProfile'
import { useABAMiniApp } from '~/composables/useNativeBridge'
import BridgeResponseModal from '~/components/Modal/BridgeResponseModal.vue'

interface Props {
  /**
   * Simulated duration in milliseconds if manually simulating progress.
   * When null/undefined, progress advances towards ~90% and waits for token or isLoaded.
   */
  duration?: number | null
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
  /**
   * Automatically complete when auth token is obtained from API (default: true)
   */
  waitForToken?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: null,
  progress: null,
  isLoaded: false,
  text: 'Downloading contents.......',
  fullscreen: true,
  hideOnComplete: true,
  logoSrc: '',
  waitForToken: true
})

const emit = defineEmits<{
  (e: 'complete', payload?: { newAbaUser: boolean; customer?: any }): void
  (e: 'finish', payload?: { newAbaUser: boolean; customer?: any }): void
  (e: 'update:progress', value: number): void
}>()

const { resolveAsset } = useAssetResolver()
const {
  authResponse,
  authPayload,
  apiUrl,
  isAuthPending,
  authError,
  authToken,
  authCustomer,
  isNewAbaUser,
  sendProfile
} = useSendProfile()
const { userProfile, getProfile } = useABAMiniApp()

// Bridge Response Inspector Modal state
const isBridgeModalOpen = ref<boolean>(false)
const isProfileLoading = ref<boolean>(false)
const profileError = ref<any>(null)

const handleOpenBridgeModal = () => {
  isBridgeModalOpen.value = true
}

const handleCloseBridgeModal = () => {
  isBridgeModalOpen.value = false
}

const handleRefreshProfile = async () => {
  isProfileLoading.value = true
  profileError.value = null
  try {
    const profile = await getProfile(true)
    if (profile) {
      await sendProfile(profile)
    }
  } catch (err: any) {
    profileError.value = err
    console.error('[LoadingPage] Error fetching profile/auth token:', err)
  } finally {
    isProfileLoading.value = false
  }
}

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

// Check if token has been acquired from API
const checkHasToken = (): boolean => {
  if (authToken.value) return true

  const res = authResponse.value as any
  const body = res?.body
  if (
    body?.accessToken ||
    body?.token ||
    res?.data?.accessToken ||
    res?.data?.token
  ) {
    return true
  }

  return false
}

const isTokenReceived = computed(() => {
  if (props.isLoaded) return true
  if (props.waitForToken && checkHasToken()) return true
  return false
})

/**
 * Smoothly animates progress towards ~90% while waiting for token from API.
 * Does NOT complete automatically on a 5-second timer.
 */
const startSimulatedProgress = () => {
  if (props.progress !== null) return

  startTime = null

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime

    // Smoothly advances progress curve towards ~90%, slowing down as it approaches 90-92%
    // Progress will not jump to 100% until token is received or isLoaded is true
    const progressVal = 92 * (1 - Math.exp(-elapsed / 2200))
    currentProgress.value = Math.min(92, Math.round(progressVal * 10) / 10)
    emit('update:progress', currentProgress.value)

    if (!isTokenReceived.value && !props.isLoaded) {
      animationFrameId = requestAnimationFrame(step)
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
 * Fast-finish transition: smoothly and rapidly animates to 100% when token is received from API
 */
const fastFinish = () => {
  stopAnimation()
  if (isCompleted.value) return
  if (currentProgress.value >= 100) {
    triggerComplete()
    return
  }

  const startVal = currentProgress.value
  const finishDuration = 250 // 250ms rapid fill to 100%
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
  if (isBridgeModalOpen.value) return
  isCompleted.value = true
  currentProgress.value = 100
  emit('update:progress', 100)

  // Allow 200ms for user to perceive 100% progress before initiating transition
  setTimeout(() => {
    const isNew = getIsNewAbaUser()
    const payload = {
      newAbaUser: isNew,
      customer: authCustomer?.value || (authResponse.value as any)?.body
    }

    if (props.hideOnComplete) {
      isVisible.value = false
      // Wait for the 350ms CSS fade-out transition to finish before emitting complete
      setTimeout(() => {
        emit('complete', payload)
        emit('finish', payload)
      }, 350)
    } else {
      emit('complete', payload)
      emit('finish', payload)
    }
  }, 200)
}

watch(isBridgeModalOpen, (isOpen) => {
  if (!isOpen && isTokenReceived.value) {
    triggerComplete()
  }
})

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

// Watch API token reception or isLoaded flag
watch(
  isTokenReceived,
  (received) => {
    if (received) {
      fastFinish()
    }
  },
  { immediate: true }
)

// Watch explicit isLoaded prop
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
  } else if (isTokenReceived.value) {
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
  isNewAbaUser: () => getIsNewAbaUser(),
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

        <!-- Debug inspection button -->
        <!-- <button
          type="button"
          class="debug-inspect-btn"
          @click="handleOpenBridgeModal"
        >
          <ion-icon :icon="codeWorkingOutline" />
          <span>Inspect ABA Profile & Auth API</span>
          <span v-if="authResponse || userProfile" class="badge-ready">Ready</span>
          <span v-else-if="isProfileLoading || isAuthPending" class="badge-loading">...</span>
        </button> -->
      </div>
    </div>
  </Transition>

  <!-- Bridge Response Modal for viewing profile data from ABA Mobile App & useSendProfile -->
  <BridgeResponseModal
    :is-open="isBridgeModalOpen"
    handler-name="getProfile"
    :request-payload="{}"
    :response="userProfile"
    :auth-response="authResponse"
    :auth-payload="authPayload || userProfile"
    :api-url="apiUrl"
    api-method="POST"
    :error="profileError"
    :auth-error="authError"
    :is-loading="isProfileLoading"
    :is-auth-loading="isAuthPending"
    @close="handleCloseBridgeModal"
    @refresh="handleRefreshProfile"
  />
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

/* Debug Inspection Button */
.debug-inspect-btn {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.debug-inspect-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.badge-ready {
  background: #22c55e;
  color: #ffffff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: 700;
}

.badge-loading {
  background: #3b82f6;
  color: #ffffff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: 700;
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
