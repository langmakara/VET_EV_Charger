<script setup lang="ts">
  import { ref, onBeforeUnmount } from 'vue'
  import CameraComponent from '~/components/Camera/CameraComponent.vue'
  import AlertComponent from '~/components/Modal/AlertComponent.vue'
  import ModalPlug from './modalPlug.vue'
  import Icon from '~/components/Icon/icon.vue'

  const router = useRouter()

  const chargingSteps = [
    {
      step: 1,
      icon: 'qr-code',
      title: 'Scan QR code',
      description: 'Scan the QR code on the charging machine.'
    },
    {
      step: 2,
      icon: 'amount',
      title: 'Set charging amount',
      description: 'Choose your charging amount (or kWh / price).'
    },
    {
      step: 3,
      icon: 'confirmPayment',
      title: 'Confirm payment',
      description: 'Review the details and confirm your payment.'
    },
    {
      step: 4,
      icon: 'PlugCharger',
      title: 'Plug charger to vehicle',
      description: 'Connect the charger to your EV and wait for charging to start.'
    },
    {
      step: 5,
      icon: 'TrackCharging',
      title: 'Track your charging',
      description: 'View the progress and final details in the app.'
    },
    {
      step: 6,
      icon: 'PlugCharger',
      title: 'Unplug charger',
      description: 'Safely disconnect the charger and return it to the station once finish.'
    }
  ]
  const cameraRef = ref<InstanceType<typeof CameraComponent> | null>(null)

  const result = ref('')
  const scanning = ref(true)
  const showAlert = ref(false)
  const showModalPlug = ref(false)

  let plugTimer: any = null

  onBeforeUnmount(() => {
    if (plugTimer) clearTimeout(plugTimer)
  })

  function handleScan(scannedCode: string) {
    if (!scanning.value || !scannedCode) return

    result.value = scannedCode
    scanning.value = false
    showAlert.value = true
    if (navigator.vibrate) navigator.vibrate(100)

    // Show ModalPlug 2 seconds after successful scan
    clearTimeout(plugTimer)
    plugTimer = setTimeout(() => {
      showAlert.value = false
      showModalPlug.value = true
    }, 2000)
  }

  function ProceedToPlug() {
    clearTimeout(plugTimer)
    showAlert.value = false
    showModalPlug.value = true
  }

  function ClosePlugModal() {
    showModalPlug.value = false
    ScanAgain()
  }

  const selectedPlug = ref<any>(null)

  function handlePlugSelect(plug: any) {
    selectedPlug.value = plug
  }

  function handlePlugContinue(_plug?: any) {
    showModalPlug.value = false
    navigateTo('/chargingInfor')
  }

  function ScanAgain() {
    clearTimeout(plugTimer)
    result.value = ''
    showAlert.value = false
    showModalPlug.value = false
    scanning.value = true
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      navigateTo('/')
    }
  }
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="camera-content">
      <div class="camera-wrapper">
        <CameraComponent ref="cameraRef" :enable-scan="scanning" @scan="handleScan">
          <!-- Custom Page Overlay -->
          <div class="overlay-container">
            <!-- Top bar with Back button -->
            <!-- <div class="top-bar">
              <button
                class="back-btn"
                aria-label="Back"
                @click="handleBack"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div> -->

            <!-- Top: Scan frame guide -->
            <div class="scan-guide">
              <div class="scan-box">
                <Icon name="Corner" size="250px" class="scan-corners" color="white" />
              </div>
              <p class="scan-hint">Point the camera at a QR code</p>
            </div>

            <!-- Bottom: Charger Card -->
            <div class="charger">
              <!-- Watermark Logo -->
              <!-- <div class="charger-watermark" aria-hidden="true">VET</div> -->

              <!-- Header -->
              <div class="charger-header">
                <div class="header-icon-box">
                  <Icon name="Vector-color" size="26px" color="#DE5D0A" />
                </div>
                <div class="header-info">
                  <h3 class="header-title">How to charge</h3>
                  <p class="header-subtitle">
                    Follow these simple steps to start charging your EV.
                  </p>
                </div>
              </div>

              <!-- Steps Grid -->
              <ion-grid class="steps-grid ion-no-padding">
                <ion-row>
                  <ion-col v-for="item in chargingSteps" :key="item.step" size="6" class="step-col">
                    <div class="step-item">
                      <div class="step-badge-wrapper">
                        <div class="step-icon-box">
                          <Icon :name="item.icon" size="22px" color="#DE5D0A" />
                        </div>
                        <span class="step-number">{{ item.step }}</span>
                      </div>
                      <div class="step-text">
                        <span class="step-title">{{ item.title }}</span>
                        <span class="step-desc">{{ item.description }}</span>
                      </div>
                    </div>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </div>
          </div>
        </CameraComponent>

        <!-- Success Alert Modal -->
        <AlertComponent
          :is-open="showAlert"
          type="success"
          :hide-cancel="true"
          :hide-confirm="true"
          @confirm="ProceedToPlug"
          @didDismiss="ProceedToPlug"
        />

        <!-- Plug Selection Modal (opens 2 seconds after scan) -->
        <ModalPlug
          :is-open="showModalPlug"
          @didDismiss="ClosePlugModal"
          @close="ClosePlugModal"
          @select="handlePlugSelect"
          @continue="handlePlugContinue"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .camera-content {
    --background: #000;
    --padding-top: 0;
    --padding-bottom: 0;
    --padding-start: 0;
    --padding-end: 0;
  }

  .camera-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #000;
  }

  .overlay-container {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    pointer-events: none;
    z-index: 10;
  }

  .top-bar {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 0.5rem;
    pointer-events: auto;
  }

  .back-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition:
      transform 0.15s ease,
      background 0.15s ease;
  }

  .back-btn:active {
    transform: scale(0.92);
    background: rgba(0, 0, 0, 0.6);
  }

  .scan-guide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: clamp(0.75rem, 5vh, 2.5rem);
  }

  .scan-box {
    position: relative;
    width: min(58vw, 220px);
    aspect-ratio: 1;
    border-radius: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scan-corners {
    width: 100%;
    height: 100%;
    display: block;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
  }

  .scan-hint {
    color: #fff;
    font-size: 0.95rem;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
    margin: 0;
  }

  .charger {
    width: 100%;
    border-radius: 1.25rem;
    background-color: #de5d0a;
    padding: 14px 12px 10px;
    position: relative;
    overflow: hidden;
    margin-top: auto;
    pointer-events: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    max-height: 50vh;
    /* overflow-y: auto; */
    scrollbar-width: none;
    -ms-overflow-style: none;
    z-index: 10;
  }

  .charger::-webkit-scrollbar {
    display: none;
  }

  .charger-watermark {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%) skewX(-12deg);
    font-size: 115px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.08);
    pointer-events: none;
    user-select: none;
    line-height: 1;
    letter-spacing: -3px;
    z-index: 0;
  }

  .charger-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
  }

  .header-icon-box {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 14px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .header-info {
    display: flex;
    flex-direction: column;
  }

  .header-title {
    margin: 0;
    font-size: 14px !important;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.25;
  }

  .header-subtitle {
    margin: 3px 0 0 0;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.35;
  }

  .steps-grid {
    position: relative;
    z-index: 1;
  }

  .step-col {
    padding: 6px 4px;
  }

  .step-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    height: 100%;
  }

  .step-badge-wrapper {
    position: relative;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .step-icon-box {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 12px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  .step-number {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background-color: #de5d0a;
    border: 1.5px solid #ffffff;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .step-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .charger .step-title,
  .step-title {
    font-size: 12px !important;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.25;
    margin-bottom: 2px;
  }

  .charger .step-desc,
  .step-desc {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.88);
    line-height: 1.3;
  }
</style>
