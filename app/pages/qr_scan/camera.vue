<script setup>
  import AppButton from '~/components/Button/AppButton.vue'
  import jsQR from 'jsqr'
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import AlertComponent from '~/components/Modal/AlertComponent.vue'
  import ModalPlug from './modalPlug.vue'

  const video = ref(null)
  const canvas = ref(null)
  const container = ref(null)
  const ctx = ref(null)

  const result = ref('')
  const scanning = ref(true)
  const errorMsg = ref('')
  const copied = ref(false)
  const showAlert = ref(false)
  const showModalPlug = ref(false)

  const isUrl = computed(() => /^https?:\/\//i.test(result.value))

  const SCAN_MAX_SIZE = 640 // downscale frames before decoding (much faster)
  const SCAN_INTERVAL = 150 // ms between decode attempts

  let currentStream = null
  let animId = null
  let resizeObserver = null
  let scanCanvas = null
  let scanCtx = null
  let lastScan = 0
  let lastLocation = null // outline of the detected code, in canvas pixels
  let plugTimer = null

  const constraints = {
    audio: false,
    video: {
      facingMode: { ideal: 'environment' }
    }
  }

  function updateCanvasSize() {
    if (!canvas.value || !container.value) return
    const dpr = window.devicePixelRatio || 1
    const w = Math.round(container.value.clientWidth * dpr)
    const h = Math.round(container.value.clientHeight * dpr)

    if (canvas.value.width !== w || canvas.value.height !== h) {
      canvas.value.width = w
      canvas.value.height = h
    }
  }

  onMounted(async () => {
    ctx.value = canvas.value.getContext('2d')
    scanCanvas = document.createElement('canvas')
    scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true })

    updateCanvasSize()
    resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(container.value)
    window.addEventListener('orientationchange', updateCanvasSize)

    try {
      SetStream(await navigator.mediaDevices.getUserMedia(constraints))
    } catch (e) {
      console.warn('Failed with primary constraints, trying fallback:', e)
      try {
        SetStream(await navigator.mediaDevices.getUserMedia({ audio: false, video: true }))
      } catch (err) {
        console.error('Camera access error:', err)
        errorMsg.value = 'Cannot access the camera. Please allow camera permission.'
      }
    }
  })

  onBeforeUnmount(() => {
    if (plugTimer) clearTimeout(plugTimer)
    if (animId) cancelAnimationFrame(animId)
    if (currentStream) currentStream.getTracks().forEach((t) => t.stop())
    if (resizeObserver) resizeObserver.disconnect()
    window.removeEventListener('orientationchange', updateCanvasSize)
  })

  function SetStream(stream) {
    currentStream = stream
    video.value.srcObject = stream
    video.value.play()
    animId = requestAnimationFrame(Draw)
  }

  function ScanFrame() {
    const cWidth = canvas.value.width
    const cHeight = canvas.value.height
    if (!cWidth || !cHeight) return

    const scale = Math.min(1, SCAN_MAX_SIZE / Math.max(cWidth, cHeight))
    const sw = Math.round(cWidth * scale)
    const sh = Math.round(cHeight * scale)

    if (scanCanvas.width !== sw || scanCanvas.height !== sh) {
      scanCanvas.width = sw
      scanCanvas.height = sh
    }

    // Scan exactly what the user sees on screen
    scanCtx.drawImage(canvas.value, 0, 0, sw, sh)
    const image = scanCtx.getImageData(0, 0, sw, sh)
    const code = jsQR(image.data, sw, sh, { inversionAttempts: 'dontInvert' })

    if (code && code.data) {
      const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = code.location
      lastLocation = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner].map(
        (p) => ({ x: p.x / scale, y: p.y / scale })
      )
      result.value = code.data
      scanning.value = false
      showAlert.value = true
      if (navigator.vibrate) navigator.vibrate(100)

      // Show ModalPlug 3 seconds after successful scan
      clearTimeout(plugTimer)
      plugTimer = setTimeout(() => {
        showAlert.value = false
        showModalPlug.value = true
      }, 2000)
    }
  }

  function DrawOutline() {
    if (!lastLocation) return
    const c = ctx.value
    c.beginPath()
    c.moveTo(lastLocation[0].x, lastLocation[0].y)
    for (let i = 1; i < lastLocation.length; i++) {
      c.lineTo(lastLocation[i].x, lastLocation[i].y)
    }
    c.closePath()
    c.lineWidth = 5 * (window.devicePixelRatio || 1)
    c.strokeStyle = '#22c55e'
    c.stroke()
  }

  function Draw() {
    if (!ctx.value || !canvas.value || !video.value) return

    if (video.value.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const cWidth = canvas.value.width
      const cHeight = canvas.value.height
      const vWidth = video.value.videoWidth
      const vHeight = video.value.videoHeight

      if (vWidth && vHeight) {
        const ratio = Math.max(cWidth / vWidth, cHeight / vHeight)
        const x = (cWidth - vWidth * ratio) / 2
        const y = (cHeight - vHeight * ratio) / 2

        ctx.value.clearRect(0, 0, cWidth, cHeight)
        ctx.value.drawImage(video.value, x, y, vWidth * ratio, vHeight * ratio)

        // Decode a frame (throttled) while we are still looking for a code
        const now = performance.now()
        if (scanning.value && now - lastScan >= SCAN_INTERVAL) {
          lastScan = now
          ScanFrame()
        }

        // DrawOutline()
      }
    }

    animId = requestAnimationFrame(Draw)
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

  function ScanAgain() {
    clearTimeout(plugTimer)
    result.value = ''
    lastLocation = null
    copied.value = false
    showAlert.value = false
    showModalPlug.value = false
    scanning.value = true
  }

  async function CopyResult() {
    try {
      await navigator.clipboard.writeText(result.value)
      copied.value = true
    } catch (e) {
      console.error(e)
    }
  }

  function OpenLink() {
    window.open(result.value, '_blank')
  }
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="camera-content">
      <div ref="container" class="camera-container">
        <video ref="video" autoplay playsinline webkit-playsinline muted hidden></video>
        <canvas ref="canvas" class="canvascam"></canvas>

        <!-- Scanner Overlay -->
        <div class="overlay-container">
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

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <!-- Result -->

        <!-- Success Alert Modal -->
        <AlertComponent
          :is-open="showAlert"
          type="success"
          :hide-cancel="true"
          :hide-confirm="true"
          @confirm="ProceedToPlug"
          @didDismiss="ProceedToPlug"
        />

        <!-- Plug Selection Modal (opens 3 seconds after scan) -->
        <ModalPlug
          :is-open="showModalPlug"
          @didDismiss="ClosePlugModal"
          @close="ClosePlugModal"
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

  .camera-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #000;
  }

  .canvascam {
    display: block;
    width: 100%;
    height: 100%;
  }

  .overlay-container {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: calc(3rem + env(safe-area-inset-top, 0px)) 10px
      calc(1.5rem + env(safe-area-inset-bottom, 0px)) 10px;
    pointer-events: none;
    z-index: 10;
  }

  .scan-guide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
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

  .error-msg {
    position: absolute;
    top: calc(1rem + env(safe-area-inset-top, 0px));
    left: 1rem;
    right: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba(220, 38, 38, 0.9);
    color: #fff;
    text-align: center;
    margin: 0;
  }

  /* .result-card {
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    padding: 1rem;
    border-radius: 1.25rem;
    color: #fff;
    z-index: 10;
  } */

  .result-label {
    margin: 0 0 0.25rem;
    font-size: 0.75rem;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .result-text {
    margin: 0 0 1rem;
    word-break: break-all;
    max-height: 6rem;
    overflow-y: auto;
  }

  .result-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
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
    margin-top: auto; /* Ensures it stays at the bottom even when scan-guide disappears */
  }
</style>
