<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import jsQR from 'jsQR'
import CameraComponent from '~/components/Camera/CameraComponent.vue'
import AlertComponent from '~/components/Modal/AlertComponent.vue'
import ModalPlug from './modalPlug.vue'

const router = useRouter()
const cameraRef = ref<InstanceType<typeof CameraComponent> | null>(null)

const result = ref('')
const scanning = ref(true)
const showAlert = ref(false)
const showModalPlug = ref(false)

const SCAN_MAX_SIZE = 640 // downscale frames before decoding
const SCAN_INTERVAL = 150 // ms between decode attempts

let scanCanvas: HTMLCanvasElement | null = null
let scanCtx: CanvasRenderingContext2D | null = null
let lastScanTime = 0
let plugTimer: any = null

onMounted(() => {
  scanCanvas = document.createElement('canvas')
  scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true })
})

onBeforeUnmount(() => {
  if (plugTimer) clearTimeout(plugTimer)
})

function onCameraFrame({ canvas }: { canvas: HTMLCanvasElement }) {
  if (!scanning.value || !canvas || !scanCanvas || !scanCtx) return

  const now = performance.now()
  if (now - lastScanTime < SCAN_INTERVAL) return
  lastScanTime = now

  const cWidth = canvas.width
  const cHeight = canvas.height
  if (!cWidth || !cHeight) return

  const scale = Math.min(1, SCAN_MAX_SIZE / Math.max(cWidth, cHeight))
  const sw = Math.round(cWidth * scale)
  const sh = Math.round(cHeight * scale)

  if (scanCanvas.width !== sw || scanCanvas.height !== sh) {
    scanCanvas.width = sw
    scanCanvas.height = sh
  }

  scanCtx.drawImage(canvas, 0, 0, sw, sh)
  const image = scanCtx.getImageData(0, 0, sw, sh)
  const code = jsQR(image.data, sw, sh, { inversionAttempts: 'dontInvert' })

  if (code && code.data) {
    result.value = code.data
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

function handlePlugSelect(_plug: any) {
  showModalPlug.value = false
  navigateTo('/charging')
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
        <CameraComponent
          ref="cameraRef"
          @frame="onCameraFrame"
        >
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
                <svg
                  class="scan-corners"
                  viewBox="0 0 240 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Top-left -->
                  <path
                    d="M 12 84 V 52 A 40 40 0 0 1 52 12 H 84"
                    stroke="white"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- Top-right -->
                  <path
                    d="M 156 12 H 188 A 40 40 0 0 1 228 52 V 84"
                    stroke="white"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- Bottom-right -->
                  <path
                    d="M 228 156 V 188 A 40 40 0 0 1 188 228 H 156"
                    stroke="white"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- Bottom-left -->
                  <path
                    d="M 84 228 H 52 A 40 40 0 0 1 12 188 V 156"
                    stroke="white"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <p class="scan-hint">Point the camera at a QR code</p>
            </div>

            <!-- Bottom: Charger Card -->
            <div class="charger"></div>
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
  padding: calc(1rem + env(safe-area-inset-top, 0px)) 10px
    calc(1.5rem + env(safe-area-inset-bottom, 0px)) 10px;
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
  transition: transform 0.15s ease, background 0.15s ease;
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
  margin-top: 20%;
}

.scan-box {
  position: relative;
  width: min(65vw, 240px);
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
  height: 500px;
  max-height: 38vh;
  min-height: 160px;
  padding: 10px;
  border-radius: 1rem;
  background-color: rgba(var(--ion-color-primary-rgb), 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin-top: auto;
  pointer-events: auto;
}
</style>