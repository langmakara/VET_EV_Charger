<script setup lang="ts">
  import { ref, onBeforeUnmount } from 'vue'
  import { IonPage, IonContent, IonSpinner, IonText } from '@ionic/vue'
  import CameraComponent from '~/components/Camera/CameraComponent.vue'
  import AlertComponent from '~/components/Modal/AlertComponent.vue'
  import IconButton from '~/components/Button/IconButton.vue'
  import Icon from '~/components/Icon/icon.vue'
  import { useFlashlight } from '~/composables/useFlashlight'
  import { useSearchVoucherMutation } from '~/composables/queries/useVoucher'

  const router = useRouter()
  const cameraRef = ref<InstanceType<typeof CameraComponent> | null>(null)
  const cameraStream = ref<MediaStream | null>(null)
  const { isOn: isFlashlightOn, toggle: toggleFlashlight, turnOff: turnOffFlashlight } = useFlashlight(cameraStream)

  function onCameraReady(payload: { stream: MediaStream }) {
    cameraStream.value = payload.stream
  }

  const result = ref('')
  const scanning = ref(true)
  const showAlert = ref(false)
  const isSuccess = ref(false)
  const alertTitle = ref('')
  const alertMessage = ref('')
  const alertConfirmLabel = ref('OK')
  const alertType = ref<'success' | 'delete'>('success')

  // Use mutation composable from useVoucher.ts
  const { mutateAsync: searchVoucher, isPending: isSearching } = useSearchVoucherMutation()

  // Shared state to pass scanned voucher code back to voucher list without navigateTo query
  const scannedVoucherCode = useState<string>('scannedVoucherCode', () => '')

  let successTimer: ReturnType<typeof setTimeout> | null = null
  let isNavigating = false

  function clearSuccessTimer() {
    if (successTimer) {
      clearTimeout(successTimer)
      successTimer = null
    }
  }

  function navigateBackToVoucher() {
    if (isNavigating) return
    isNavigating = true
    clearSuccessTimer()
    showAlert.value = false
    router.back()
  }

  onBeforeUnmount(() => {
    turnOffFlashlight()
    clearSuccessTimer()
  })

  /**
   * Parse code if QR contains JSON or URL
   */
  function parseVoucherCode(scannedText: string): string {
    const text = scannedText.trim()
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text)
        if (parsed.code) return String(parsed.code)
        if (parsed.voucherCode) return String(parsed.voucherCode)
      } catch {}
    }
    if (text.includes('?')) {
      try {
        const url = new URL(text)
        const code =
          url.searchParams.get('code') ||
          url.searchParams.get('voucher') ||
          url.searchParams.get('voucherCode')
        if (code) return code
      } catch {}
    }
    return text
  }

  /**
   * Handle decoded QR code emitted by CameraComponent
   */
  async function handleScan(scannedCode: string) {
    if (!scanning.value || isSearching.value || !scannedCode) return

    const parsed = parseVoucherCode(scannedCode)
    if (!parsed) return

    result.value = parsed
    scanning.value = false
    if (navigator.vibrate) navigator.vibrate(100)

    // Send code using searchVoucher from useVoucher.ts
    try {
      const res = await searchVoucher(parsed)

      const rawData = (res as any)?.data ?? res?.body?.data
      const items = Array.isArray(rawData)
        ? rawData
        : rawData?.list ?? (rawData ? [rawData] : [])

      if (items && items.length > 0) {
        // Success: voucher found
        const voucher = items[0]
        scannedVoucherCode.value = parsed
        isSuccess.value = true
        alertType.value = 'success'
        alertTitle.value = 'Success'
        alertMessage.value = voucher?.batchTitle || 'Voucher found successfully.'
        showAlert.value = true

        // Show success alert for 4s, then automatically close and back route
        clearSuccessTimer()
        successTimer = setTimeout(() => {
          navigateBackToVoucher()
        }, 4000)
      } else {
        // Not found: response has no data
        isSuccess.value = false
        alertType.value = 'delete'
        alertTitle.value = 'Voucher Not Found'
        alertMessage.value =
          res?.body?.message || 'No voucher found. Please try scanning again.'
        alertConfirmLabel.value = 'Scan Again'
        showAlert.value = true
      }
    } catch (err: any) {
      console.error('Failed to search voucher:', err)
      isSuccess.value = false
      alertType.value = 'delete'
      alertTitle.value = 'Voucher Not Found'
      const errRes = err?.response?.data
      alertMessage.value =
        errRes?.body?.message ||
        errRes?.message ||
        err?.message ||
        'Voucher was not found. Please try scanning again.'
      alertConfirmLabel.value = 'Scan Again'
      showAlert.value = true
    }
  }

  function handleAlertConfirm() {
    clearSuccessTimer()
    showAlert.value = false
    if (isSuccess.value) {
      navigateBackToVoucher()
    } else {
      ScanAgain()
    }
  }

  function handleAlertCancel() {
    clearSuccessTimer()
    showAlert.value = false
    if (!isSuccess.value) {
      ScanAgain()
    }
  }

  function handleDidDismiss() {
    if (isSuccess.value) {
      navigateBackToVoucher()
    }
  }

  function ScanAgain() {
    clearSuccessTimer()
    isNavigating = false
    result.value = ''
    showAlert.value = false
    isSuccess.value = false
    scanning.value = true
  }

  function handleBack() {
    clearSuccessTimer()
    showAlert.value = false
    router.back()
  }
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="camera-content">
      <div class="camera-wrapper">
        <CameraComponent
          ref="cameraRef"
          :enable-scan="scanning && !isSearching"
          @scan="handleScan"
          @ready="onCameraReady"
        >
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
                <Icon name="Corner" size="250px" class="scan-corners" color="white" />
              </div>
            </div>
            <div class="scan-info">
              <Icon name="QRcode" size="32px"/>
              <ion-text class="scan-info-text"
                >Please scan the voucher QR Code to search</ion-text
              >
            </div>
            <div class="flashlight">
              <IconButton
                buttonType="flashlight"
                buttonSize="64px"
                iconSize="26px"
                rounded
                :color="isFlashlightOn ? 'warning' : 'light'"
                :class="{ 'flashlight-btn--active': isFlashlightOn }"
                aria-label="Flashlight"
                @click="toggleFlashlight"
              />
              <br />
              <ion-text class="flashlight-label">Flashlight</ion-text>
            </div>
          </div>
        </CameraComponent>

        <!-- Verifying Spinner Overlay -->
        <div v-if="isSearching" class="searching-overlay">
          <ion-spinner name="crescent" color="light" />
          <ion-text color="light" class="searching-text">Checking voucher...</ion-text>
        </div>

        <!-- Alert Modal: Success or Not Found -->
        <AlertComponent
          :is-open="showAlert"
          :type="alertType"
          :title="alertTitle"
          :message="alertMessage"
          :hide-cancel="isSuccess"
          :hide-confirm="isSuccess"
          :label-confirm="alertConfirmLabel"
          label-cancel="Cancel"
          @confirm="handleAlertConfirm"
          @cancel="handleAlertCancel"
          @didDismiss="handleDidDismiss"
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
    margin-top: 100px;
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
    margin-bottom: 20px;
    pointer-events: auto;
  }
  .flashlight-btn--active {
    --box-shadow: 0 0 18px rgba(255, 196, 9, 0.8);
    filter: drop-shadow(0 0 12px rgba(255, 196, 9, 0.7));
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

  .searching-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.65);
    z-index: 20;
    pointer-events: auto;
  }

  .searching-text {
    margin-top: 12px;
    font-size: 16px;
    font-weight: 500;
  }
</style>
