<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import jsQR from 'jsQR'
  import CameraComponent from '~/components/Camera/CameraComponent.vue'
  import AlertComponent from '~/components/Modal/AlertComponent.vue'
  import IconButton from '~/components/Button/IconButton.vue'
import Icon from '~/components/Icon/icon.vue'

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
    <ion-content ion-content :fullscreen="true" :scroll-y="false" class="camera-content">
      <div class="camera-wrapper">
        <CameraComponent ref="cameraRef" @frame="onCameraFrame">
          <!-- Custom Page Overlay -->
          <div class="overlay-container">
            <!-- Top bar with Back button -->
            <div class="top-bar">
              <IconButton
                buttonType="back"
                buttonSize="50px"
                iconSize="26px"
                color="light"
                rounded
                aria-label="Back"
                @click="handleBack"
              />
            </div>

            <!-- Top: Scan frame guide -->
            <div class="scan-guide">
              <div class="scan-box">
                <Icon name="Corner" size="300px" class="scan-corners" color="white" />
              </div>
            </div>
            <div class="scan-info">
              <Icon name="QRcode" size="32px"/>
              <ion-text class="scan-info-text"
                >Please scan the promotion QR Code to confirm</ion-text
              >
            </div>
            <div class="flashlight">
              <IconButton
                buttonType="flashlight"
                buttonSize="64px"
                iconSize="26px"
                rounded
                color="light"
              />
              <br />
              <ion-text class="flashlight-label">Flashlight</ion-text>
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

  .scan-guide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 150px;
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

  .flashlight {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 90px;
  }
  .flashlight-label {
    font-size: var(--app-font-size-title);
    font-weight: 600;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }

  .top-bar {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 0.5rem;
    pointer-events: auto;
  }

  .scan-info {
    background-color: var(--ion-color-primary);
    padding: var(--ion-padding);
    font-size: var(--app-font-size-normal);
    font-weight: 500;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
    border-radius: var(--ion-padding);
    width: 250px;
  }
  .scan-info-text {
    margin-left: 10px;
  }
</style>
