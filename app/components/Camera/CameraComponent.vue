<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import jsQR from 'jsQR'

const props = withDefaults(
  defineProps<{
    facingMode?: 'environment' | 'user'
    autoStart?: boolean
    showError?: boolean
    enableScan?: boolean
    scanInterval?: number
    scanMaxSize?: number
  }>(),
  {
    facingMode: 'environment',
    autoStart: true,
    showError: true,
    enableScan: true,
    scanInterval: 150,
    scanMaxSize: 640
  }
)

const emit = defineEmits<{
  (e: 'ready', payload: {
    video: HTMLVideoElement
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    stream: MediaStream
  }): void
  (e: 'frame', payload: {
    video: HTMLVideoElement
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
  }): void
  (e: 'scan', code: string): void
  (e: 'error', error: any): void
  (e: 'stop'): void
}>()

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

const isStreaming = ref(false)
const errorMsg = ref('')

let currentStream: MediaStream | null = null
let animId: number | null = null
let resizeObserver: ResizeObserver | null = null

// Internal scanner performance & downscale canvas
let scanCanvas: HTMLCanvasElement | null = null
let scanCtx: CanvasRenderingContext2D | null = null
let lastScanTime = 0

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

async function startCamera() {
  stopCamera()
  errorMsg.value = ''

  if (!canvas.value) return
  ctx.value = canvas.value.getContext('2d')
  updateCanvasSize()

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      facingMode: { ideal: props.facingMode }
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    setStream(stream)
  } catch (e) {
    console.warn('Failed with primary constraints, trying fallback:', e)
    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      })
      setStream(fallbackStream)
    } catch (err: any) {
      console.error('Camera access error:', err)
      errorMsg.value = 'Cannot access the camera. Please allow camera permission.'
      emit('error', err)
    }
  }
}

function setStream(stream: MediaStream) {
  currentStream = stream
  if (!video.value) return
  video.value.srcObject = stream
  video.value.play().catch((err) => {
    console.warn('Video play interrupted:', err)
  })
  isStreaming.value = true

  if (video.value && canvas.value && ctx.value) {
    emit('ready', {
      video: video.value,
      canvas: canvas.value,
      ctx: ctx.value,
      stream
    })
  }

  if (animId) cancelAnimationFrame(animId)
  animId = requestAnimationFrame(draw)
}

function draw() {
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

      emit('frame', {
        video: video.value,
        canvas: canvas.value,
        ctx: ctx.value
      })

      // QR Code Scanning: 1. Throttling & Downscaling, 2. QR Code Decoding
      if (props.enableScan && scanCanvas && scanCtx) {
        const now = performance.now()
        if (now - lastScanTime >= props.scanInterval) {
          lastScanTime = now
          decodeQRCode(canvas.value)
        }
      }
    }
  }

  animId = requestAnimationFrame(draw)
}

function decodeQRCode(sourceCanvas: HTMLCanvasElement) {
  if (!scanCanvas || !scanCtx) return
  const cWidth = sourceCanvas.width
  const cHeight = sourceCanvas.height
  if (!cWidth || !cHeight) return

  // Downscale frame to scanMaxSize (default 640px)
  const scale = Math.min(1, props.scanMaxSize / Math.max(cWidth, cHeight))
  const sw = Math.round(cWidth * scale)
  const sh = Math.round(cHeight * scale)

  if (scanCanvas.width !== sw || scanCanvas.height !== sh) {
    scanCanvas.width = sw
    scanCanvas.height = sh
  }

  scanCtx.drawImage(sourceCanvas, 0, 0, sw, sh)
  const image = scanCtx.getImageData(0, 0, sw, sh)
  const code = jsQR(image.data, sw, sh, { inversionAttempts: 'dontInvert' })

  if (code && code.data) {
    emit('scan', code.data)
  }
}

function stopCamera() {
  if (animId) {
    cancelAnimationFrame(animId)
    animId = null
  }
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop())
    currentStream = null
  }
  if (video.value) {
    video.value.srcObject = null
  }
  isStreaming.value = false
  emit('stop')
}

function takePhoto(type: string = 'image/png', quality?: number): string | null {
  if (!canvas.value) return null
  return canvas.value.toDataURL(type, quality)
}

onMounted(() => {
  scanCanvas = document.createElement('canvas')
  scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true })

  if (container.value) {
    resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(container.value)
  }
  window.addEventListener('orientationchange', updateCanvasSize)

  if (props.autoStart) {
    startCamera()
  }
})

onBeforeUnmount(() => {
  stopCamera()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('orientationchange', updateCanvasSize)
  scanCanvas = null
  scanCtx = null
})

defineExpose({
  video,
  canvas,
  container,
  ctx,
  isStreaming,
  errorMsg,
  startCamera,
  stopCamera,
  takePhoto,
  updateCanvasSize
})
</script>

<template>
  <div ref="container" class="camera-component">
    <video
      ref="video"
      autoplay
      playsinline
      webkit-playsinline
      muted
      hidden
    ></video>
    <canvas ref="canvas" class="camera-canvas"></canvas>

    <!-- Error Message -->
    <p v-if="errorMsg && showError" class="camera-error-msg">
      {{ errorMsg }}
    </p>

    <!-- Custom overlay slot (customized by each page) -->
    <div class="camera-overlay">
      <slot
        :video="video"
        :canvas="canvas"
        :is-streaming="isStreaming"
        :error-msg="errorMsg"
      />
    </div>
  </div>
</template>

<style scoped>
.camera-component {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
}

.camera-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.camera-error-msg {
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
  z-index: 20;
  pointer-events: auto;
}

.camera-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.camera-overlay > :deep(*) {
  pointer-events: auto;
}
</style>
