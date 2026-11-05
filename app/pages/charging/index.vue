<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonCard,
    IonCardContent,
    IonButton,
    useBackButton
  } from '@ionic/vue'
  import Icon from '~/components/Icon/icon.vue'
  import AlertComponent from '~/components/Modal/AlertComponent.vue'
  import {
    useWebSocket,
    type OcpiCommandPayload,
    type OcpiMeterValuesPayload
  } from '~/composables/useChargintSocket'
  import { useRoute, navigateTo } from '#app'
  import { onBeforeRouteLeave } from 'vue-router'
  import { abaBridge, sendTitleToFlutter } from '~/composables/useNativeBridge'
  import { formatMins, formatSeconds } from '~/utils/formatters'
  import { useStationPricePerKwhQuery } from '~/composables/queries'

  const route = useRoute()

  // 1. Session & Charger identifiers
  const chargerCode = computed(() => {
    return String(
      route.query.chargerCode ||
        route.query.chargerUsername ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('vet_ev_charger_username') : '')
    )
  })

  const transactionId = computed(() => {
    return String(
      route.query.transactionId ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('vet_ev_transaction_id') : '') ||
        ''
    )
  })

  const plugId = computed(() => {
    return Number(
      route.query.plugId ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('vet_ev_plug_id') : '')
    )
  })

  // Station Price Per kWh from API
  const priceParams = computed(() => ({
    chargerUserName: chargerCode.value,
    plugId: plugId.value
  }))

  const { data: pricePerKwhData } = useStationPricePerKwhQuery(priceParams)

  const pricePerKwh = computed(() => {
    const res: any = pricePerKwhData.value?.data ?? pricePerKwhData.value?.body?.data
    const rate = res?.pricePerKwh ?? res?.price_per_kwh
    if (rate != null && Number(rate) > 0) {
      return Number(rate)
    }
    const fromQuery = Number(route.query.pricePerKwh)
    if (!isNaN(fromQuery) && fromQuery > 0) {
      return fromQuery
    }
    if (typeof window !== 'undefined') {
      const stored = Number(sessionStorage.getItem('vet_ev_price_per_kwh'))
      if (!isNaN(stored) && stored > 0) {
        return stored
      }
    }
    return 0
  })

  const startSessionData = ref<OcpiCommandPayload | null>(null)

  const targetKwh = computed(() => {
    const fromSocket = Number(startSessionData.value?.totalKwh)
    if (!isNaN(fromSocket) && fromSocket > 0) {
      return fromSocket
    }
    const fromQuery = Number(route.query.totalKwh)
    if (!isNaN(fromQuery) && fromQuery > 0) {
      return fromQuery
    }
    if (typeof window !== 'undefined') {
      const stored = Number(sessionStorage.getItem('vet_ev_total_kwh'))
      if (!isNaN(stored) && stored > 0) {
        return stored
      }
    }
    return 0
  })

  // 2. WebSocket Connection for live OCPI telemetry
  const config = useRuntimeConfig()
  const webSocketUrl = config.public.webSocketUrl || 'qacltom.udaya-tech.com'
  const wsUrl =
    webSocketUrl.startsWith('ws://') || webSocketUrl.startsWith('wss://')
      ? webSocketUrl
      : `wss://${webSocketUrl}/OCPI/ws`

  const {
    data: socketData,
    status: socketStatus,
    send
  } = useWebSocket(wsUrl, {
    evseUid: chargerCode
  })

  // 3. Telemetry State from WebSocket
  const meterValues = ref<OcpiMeterValuesPayload | null>(null)
  const isCharging = ref(false)
  const batteryProgress = ref(0) // State of Charge (soc) 0 - 100%

  // Listen to WebSocket messages (START_SESSION, MeterValues, STOP_SESSION)
  watch(
    socketData,
    (msg) => {
      if (!msg || typeof msg !== 'object') return

      console.log('[Charging Page] OCPI command received:', msg)

      switch (msg.command_type) {
        case 'START_SESSION':
          isCharging.value = true
          startSessionData.value = msg
          if (msg.totalKwh !== undefined && msg.totalKwh !== null) {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('vet_ev_total_kwh', String(msg.totalKwh))
            }
          }
          if (msg.transactionId) {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('vet_ev_transaction_id', String(msg.transactionId))
            }
          }
          break

        case 'MeterValues':
          isCharging.value = true
          meterValues.value = msg
          if (msg.soc !== undefined && msg.soc !== null) {
            batteryProgress.value = Math.min(100, Math.max(0, Number(msg.soc)))
          }
          break

        case 'STOP_SESSION':
          isCharging.value = false
          navigateTo('/session_summary')
          break
      }
    },
    { immediate: true }
  )

  // Estimated Time Remaining
  const estimatedTimeText = computed(() => {
    const rem = meterValues.value?.remaining
    if (rem !== undefined && rem !== null) {
      return formatSeconds(Number(rem), '0 mins')
    }
    return '0 mins'
  })

  // Time Elapsed
  const timeElapsedText = computed(() => {
    const dur = meterValues.value?.duration
    if (dur !== undefined && dur !== null) {
      return formatSeconds(Number(dur), '0s')
    }
    return '0s'
  })

  // Voltage (V)
  const voltageValue = computed(() => {
    return Number(meterValues.value?.voltage ?? meterValues.value?.v ?? 0)
  })

  const voltageText = computed(() => {
    return `${voltageValue.value} V`
  })

  // Current (A) - calculated as W / V if not supplied directly
  const currentText = computed(() => {
    if (meterValues.value?.current != null) {
      return `${Math.round(Number(meterValues.value.current))} kw`
    }
    const watts = Number(meterValues.value?.w ?? 0)
    if (watts > 0 && voltageValue.value > 0) {
      return `${Math.round(watts / voltageValue.value)} kw`
    }
    return '0 kw'
  })

  // Energy: charged / target kWh
  const energyText = computed(() => {
    const charged = Number(
      meterValues.value?.kwh ?? (meterValues.value?.wh ? meterValues.value.wh / 1000 : 0)
    )
    return `${charged.toFixed(2)} / ${targetKwh.value} kWh`
  })

  // Estimated Cost (KHR)
  const estimatedCostText = computed(() => {
    const charged = Number(meterValues.value?.kwh ?? 0)
    const cost = Math.round(charged * pricePerKwh.value)
    return `៛${cost.toLocaleString('en-US')}.00`
  })

  // 5. Alerts & Stop Flow
  const isStopAlertOpen = ref(false)
  const isFullyChargedAlertOpen = ref(false)

  const handleStopConfirm = () => {
    isStopAlertOpen.value = false

    // Send STOP_SESSION command to WebSocket
    send({
      command_type: 'STOP_SESSION',
      evse_uid: chargerCode.value,
      transactionId: transactionId.value || meterValues.value?.transactionId || '001793717898332',
      plug: plugId.value
    })

    navigateTo('/session_summary')
  }

  watch(
    batteryProgress,
    (newVal) => {
      if (newVal >= 100) {
        isFullyChargedAlertOpen.value = true
      }
    },
    { immediate: true }
  )

  const handleFullyChargedConfirm = () => {
    isFullyChargedAlertOpen.value = false
    navigateTo('/ev_charger')
  }

  const circumference = 251.3
  const progressOffset = computed(() => {
    return circumference - (circumference * batteryProgress.value) / 100
  })

  const progressColor = computed(() => {
    if (batteryProgress.value <= 20) {
      return '#C00000' // Red for low battery
    } else if (batteryProgress.value >= 80) {
      return '#00A651' // Solid green for full
    }
    return '#A4C214' // Lime green for normal charging
  })

  // 6. Native App Bar Title & Back Button Handling (Mobile App & Phone Back)
  const onPopState = () => {
    abaBridge.backToHomePage()
  }

  onMounted(() => {
    sendTitleToFlutter('Charging')
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', onPopState)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', onPopState)
    }
  })

  // Intercept phone hardware / gesture back button
  useBackButton(9999, () => {
    if (isStopAlertOpen.value) {
      isStopAlertOpen.value = false
      return
    }
    if (isFullyChargedAlertOpen.value) {
      isFullyChargedAlertOpen.value = false
      return
    }
    abaBridge.backToHomePage()
  })

  // Prevent routing back to payment/order info; return to native mobile home
  onBeforeRouteLeave((to, from) => {
    if (to.path === '/session_summary' || to.path === '/ev_charger') {
      return true
    }
    abaBridge.backToHomePage()
    return false
  })
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-grid class="main-grid">
        <ion-row class="ion-margin-top">
          <ion-col size="12" class="ion-text-center">
            <ion-text class="battery-label">
              <p>Battery</p>
            </ion-text>
          </ion-col>
        </ion-row>

        <ion-row style="justify-content: center">
          <ion-col size="auto" class="progress-container">
            <svg viewBox="0 0 100 100" class="circular-progress">
              <circle cx="50" cy="50" r="40" class="bg-circle" />
              <circle
                cx="50"
                cy="50"
                r="40"
                class="progress-circle"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                :style="{ stroke: progressColor }"
              />
            </svg>
            <span class="progress-inner">
              <span class="center-flash-icon">
                <Icon name="flash" size="20px" color="#A4C214" />
              </span>
              <ion-text class="progress-text">
                <span class="value">{{ batteryProgress }}</span>
                <span class="symbol">%</span>
              </ion-text>
            </span>
          </ion-col>
        </ion-row>

        <ion-row class="ion-margin-bottom">
          <ion-col size="12" class="ion-text-center">
            <ion-text class="estimated-time">
              <span>Estimated Time :</span> <span class="time-value">{{ estimatedTimeText }}</span>
            </ion-text>
          </ion-col>
        </ion-row>

        <ion-row class="stats-row">
          <!-- Time Elapsed -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Time Elapsed</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-orange">
                    <Icon name="time-elapsed" size="22px" color="white" />
                  </span>
                  <ion-text class="stat-value"
                    ><span>{{ timeElapsedText }}</span></ion-text
                  >
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Current -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Current</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-green">
                    <Icon name="current" size="22px" />
                  </span>
                  <ion-text class="stat-value"
                    ><span>{{ currentText }}</span></ion-text
                  >
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Voltage -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Voltage</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-blue">
                    <Icon name="voltage" size="22px" color="white" />
                  </span>
                  <ion-text class="stat-value"
                    ><span>{{ voltageText }}</span></ion-text
                  >
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Energy -->
          <ion-col size="6">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Energy</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-red">
                    <Icon name="energy" size="22px" color="white" />
                  </span>
                  <ion-text class="stat-value"
                    ><span>{{ energyText }}</span></ion-text
                  >
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Estimated Cost -->
        <ion-row>
          <ion-col size="12">
            <ion-card class="stat-card">
              <ion-card-content class="card-content">
                <ion-text class="stat-label"><p>Estimated Cost</p></ion-text>
                <ion-row class="ion-align-items-center ion-nowrap stat-row-inner">
                  <span class="stat-icon icon-yellow">
                    <Icon name="cost" size="22px" />
                  </span>
                  <ion-text class="stat-value"
                    ><span>{{ estimatedCostText }}</span></ion-text
                  >
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row class="footer-row ion-align-items-stretch ion-margin-top">
          <ion-col size="9" class="warning-col">
            <ion-card class="warning-card">
              <ion-card-content class="warning-content">
                <ion-row class="ion-align-items-center ion-nowrap">
                  <ion-col size="auto" class="warning-icon-col">
                    <img src="/images/don.svg" alt="Do not unplug" class="custom-warning-icon" />
                  </ion-col>
                  <ion-col>
                    <ion-text class="warning-text">
                      <span class="warning-note">Note:</span> You cannot unplug the power while
                      charging.
                    </ion-text>
                  </ion-col>
                </ion-row>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="3" class="stop-col ion-text-right">
            <ion-button class="stop-button" expand="block" @click="isStopAlertOpen = true">
              <span class="stop-button-content">
                <Icon name="power" size="24px" color="#E53935" class="stop-icon" />
                <ion-text class="stop-text">Stop</ion-text>
              </span>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <AlertComponent
        :is-open="isStopAlertOpen"
        type="stop"
        @cancel="isStopAlertOpen = false"
        @confirm="handleStopConfirm"
        @didDismiss="isStopAlertOpen = false"
      />

      <AlertComponent
        :is-open="isFullyChargedAlertOpen"
        type="custom"
        title="Fully Charged!"
        message="Please unplug the charger before traveling.<br>Thank you."
        label-confirm="Continue"
        hide-cancel
        outline-confirm
        @confirm="handleFullyChargedConfirm"
        @didDismiss="isFullyChargedAlertOpen = false"
      >
        <template #icon>
          <Icon name="battery-full" size="64px" color="#000000" />
        </template>
      </AlertComponent>
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .main-grid {
    padding: 0;
  }

  .battery-label p {
    color: #8c99a8;
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }

  .progress-container {
    position: relative;
    width: 220px;
    height: 220px;
    margin: 10px 0;
  }

  .circular-progress {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .bg-circle {
    fill: none;
    stroke: #e2e8f0;
    stroke-width: 12;
  }

  .progress-circle {
    fill: none;
    stroke-width: 12;
    stroke-linecap: butt;
    transition:
      stroke-dashoffset 0.5s ease-in-out,
      stroke 0.5s ease-in-out;
  }

  .progress-inner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .center-flash-icon {
    background-color: #558b2f;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
  }

  .progress-text {
    color: #1e293b;
    display: flex;
    align-items: baseline;
  }

  .progress-text .value {
    font-size: 48px;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .progress-text .symbol {
    font-size: 20px;
    font-weight: 600;
    margin-left: 4px;
  }

  .estimated-time {
    font-size: var(--app-font-size-normal);
    font-weight: 600;
    color: #1e293b;
  }

  .estimated-time .time-value {
    color: #009b4d;
  }

  .stats-row {
    margin-top: 10px;
  }

  .stat-card {
    margin: 0 0 12px 0;
    background: #f8fafc;
    box-shadow: none;
    border-radius: 12px;
    padding: 0;
  }
  .card-content {
    padding: 10px;
  }
  ion-card-content {
    padding: 16px;
  }

  .stat-label p {
    margin: 0;
    color: #8c99a8;
    font-size: 14px;
  }

  .stat-row-inner {
    margin-top: 10px;
    flex-wrap: nowrap;
    gap: 12px;
  }

  .stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-orange {
    background-color: #e65100;
  }

  .icon-green {
    background-color: #009b4d;
  }

  .icon-blue {
    background-color: #2962ff;
  }

  .icon-red {
    background-color: #ff3d00;
  }

  .icon-yellow {
    background-color: #ffb300;
  }

  .stat-value {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .stat-value span {
    font-size: var(--app-font-size-normal);
    font-weight: 700;
    color: #1e293b;
  }

  .bg-white {
    background-color: #ffffff;
  }

  .footer-row {
    flex-wrap: nowrap;
    gap: 12px;
  }

  .warning-col {
    padding: 0;
    display: flex;
  }

  .warning-card {
    margin: 0;
    box-shadow: none;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    width: 100%;
    padding: 10px;
  }

  .warning-content {
    padding: 0;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .warning-icon-col {
    padding: 0 12px 0 0;
    display: flex;
    align-items: center;
  }

  .custom-warning-icon {
    width: 44px;
    height: 44px;
    object-fit: contain;
  }

  .warning-text {
    font-size: 14px;
    line-height: 1.4;
    color: #1e293b;
    font-weight: 500;
    margin: 0;
  }

  .warning-note {
    color: #e53935;
    font-weight: 700;
  }

  .stop-col {
    padding: 0;
  }

  .stop-button {
    --background: #ffeaea;
    --background-hover: #ffd6d6;
    --background-activated: #ffc2c2;
    --color: #e53935;
    --box-shadow: none;
    --border-radius: 15px;
    margin: 0;
    height: 100%;
    width: 90%;
  }

  .stop-button-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .stop-icon {
    font-size: 24px;
  }

  .stop-text {
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
  }
</style>
