<script setup lang="ts">
  import { ref, watch, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import {
    IonPage,
    IonContent,
    IonCardContent,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonAvatar,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    onIonViewWillLeave
  } from '@ionic/vue'
  import { chevronForward } from 'ionicons/icons'
  import AppCard from '~/components/Card/AppCard.vue'
  import AppButton from '~/components/Button/AppButton.vue'
  import Icon from '~/components/Icon/icon.vue'
  import SectionHeader from '~/components/SectionHeader.vue'
  import StationDetailModal from '../../components/Modal/StationDetailModal.vue'
  import StationCard from '~/components/Card/StationCard.vue'
  import { useDeviceLocation } from '~/composables/useNativeBridge'

  import evChargerData from '~/data/ev_charger_data.json'
  import IconButton from '~/components/Button/IconButton.vue'
  import { useStationInfinite } from '~/composables/queries/useStation'
  import type {
    StationData,
    StationListParams,
    NewFeedData,
    ChargingStatusData,
    MembershipInfoData
  } from '~/api/types'
  import { useNewFeedQuery } from '~/composables/queries/dropdonwQueries.ts'
  import { useChargingStatusQuery } from '~/composables/queries/useProfile'
  import { useMembershipInfoQuery } from '~/composables/queries/useMembership.ts'
  import { useWebSocket, type OcpiMeterValuesPayload } from '~/composables/useChargintSocket'
  import { formatMins, formatSeconds } from '~/utils/formatters'
  import { NO_IMAGE_AVAILABLE } from '~/composables/useAssetResolver'
  import { useABAMiniApp } from '@/composables/useNativeBridge'
  
  const { userProfile } = useABAMiniApp()

  const { actions } = evChargerData
  const { t, locale } = useI18n()
  const { data: membershipInfo, error } = useMembershipInfoQuery()

  const membership = computed<MembershipInfoData | null>(() => {
    const res: any = membershipInfo.value
    return res?.data ?? res?.body?.data ?? null
  })

  const { data: charging } = useChargingStatusQuery()
  const chargingStatus = computed<ChargingStatusData | null>(() => {
    return charging.value?.body?.data ?? null
  })

  // Reactive query parameters (filter payload for POST /station/list)
  const filter = ref<StationListParams>({
    rowsPerPage: 5
  })

  const { data, isLoading, isError } = useStationInfinite(filter)

  const NewFeedFilter = ref({
    page: 1,
    rowsPerPage: 5
  })

  const {
    data: newsFeedRes,
    isLoading: isNewsFeedLoading,
    isError: isNewsFeedError
  } = useNewFeedQuery(NewFeedFilter)

  const config = useRuntimeConfig()
  const evChargerBaseUrl = computed(() => ((config.public.apiBase as string) || '').replace(/\/+$/, ''))

  const resolveNewsImage = (img?: string) => {
    if (!img) return '/images/station.svg'
    if (img.startsWith('http') || img.startsWith('data:')) return img
    if (
      img.startsWith('/images') ||
      img.startsWith('/icons') ||
      img.startsWith('/vet-ev-charger')
    ) {
      return img
    }
    return `${evChargerBaseUrl.value}${img.startsWith('/') ? '' : '/'}${img}`
  }

  // Extract news feed from newsFeedRes and map fields for card template
  const NewFeed = computed(() => {
    const raw: any = newsFeedRes.value?.data ?? newsFeedRes.value?.body?.data
    const list: NewFeedData[] = Array.isArray(raw) ? raw : (raw?.list ?? [])
    const currentLocale = locale.value
    return list.map((item) => {
      let title = ''
      let description = ''
      if (currentLocale === 'km') {
        title = item.titleKh || item.titleEn || item.titleZh || (item as any).title || ''
        description =
          item.descriptionKh ||
          item.descriptionEn ||
          item.descriptionZh ||
          (item as any).description ||
          ''
      } else if (currentLocale === 'zh') {
        title = item.titleZh || item.titleEn || item.titleKh || (item as any).title || ''
        description =
          item.descriptionZh ||
          item.descriptionEn ||
          item.descriptionKh ||
          (item as any).description ||
          ''
      } else {
        title = item.titleEn || item.titleKh || item.titleZh || (item as any).title || ''
        description =
          item.descriptionEn ||
          item.descriptionKh ||
          item.descriptionZh ||
          (item as any).description ||
          ''
      }
      return {
        ...item,
        title,
        description,
        image: resolveNewsImage(item.feedUrl || item.profileUrl || (item as any).image)
      }
    })
  })

  const { currentCoordinates, triggerHardwareSync } = useDeviceLocation()

  watch(
    () => currentCoordinates.value,
    (coords) => {
      if (coords?.latitude && coords?.longitude) {
        const lat = Number(coords.latitude)
        const lng = Number(coords.longitude)
        if (!isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)) {
          // Updating filter automatically triggers useStationInfinite!
          filter.value = {
            ...filter.value,
            lats: lat,
            longs: lng
          }
        }
      }
    },
    { immediate: true }
  )

  onMounted(async () => {
    try {
      await triggerHardwareSync()
    } catch (err) {
      console.warn('Could not trigger GPS location hardware sync:', err)
    }
  })

  // Flatten all pagination pages
  const rawStations = computed<StationData[]>(() => {
    return (
      data.value?.pages.flatMap((page) => {
        const res = (page as any)?.data ?? page?.body?.data
        return Array.isArray(res) ? res : (res?.list ?? [])
      }) ?? []
    )
  })

  const displayedStations = computed<StationData[]>(() => {
    if (rawStations.value.length > 0) {
      return rawStations.value.slice(0, 5)
    }
    return []
  })

  // 1. Session & Charger identifiers for WebSocket telemetry
  const chargerCode = computed(() => {
    return String(
      (chargingStatus.value as any)?.chargerUsername ||
        (chargingStatus.value as any)?.chargerCode ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('vet_ev_charger_username') : '') ||
        'ev01'
    )
  })

  // 2. WebSocket Connection for live OCPI telemetry
  const webSocketUrl = config.public.webSocketUrl || 'qacltom.udaya-tech.com'
  const wsUrl =
    webSocketUrl.startsWith('ws://') || webSocketUrl.startsWith('wss://')
      ? webSocketUrl
      : `wss://${webSocketUrl}/OCPI/ws`

  const { data: socketData } = useWebSocket(wsUrl, {
    evseUid: chargerCode
  })

  // 3. Telemetry State from WebSocket
  const meterValues = ref<OcpiMeterValuesPayload | null>(null)
  const isChargingSocket = ref<boolean | null>(null)
  const batteryProgress = ref<number | null>(null) // State of Charge (soc) 0 - 100%

  // Listen to WebSocket messages (START_SESSION, MeterValues, STOP_SESSION)
  watch(
    socketData,
    (msg) => {
      if (!msg || typeof msg !== 'object') return

      console.log('[EV Charger Home] OCPI command received:', msg)

      switch (msg.command_type) {
        case 'START_SESSION':
          isChargingSocket.value = true
          break

        case 'MeterValues':
          isChargingSocket.value = true
          meterValues.value = msg
          if (msg.soc !== undefined && msg.soc !== null) {
            batteryProgress.value = Math.min(100, Math.max(0, Number(msg.soc)))
          }
          break

        case 'STOP_SESSION':
          isChargingSocket.value = false
          break
      }
    },
    { immediate: true }
  )

  // Estimated Time Remaining (WebSocket -> API chargingStatus -> fallback)
  const estimatedTimeText = computed(() => {
    const rem = meterValues.value?.remaining
    if (rem !== undefined && rem !== null) {
      return formatSeconds(Number(rem))
    }
    if (chargingStatus.value?.estTime) {
      return String(chargingStatus.value.estTime)
    }
    return '0 mins'
  })

  // Battery percentage (WebSocket -> API chargingStatus -> fallback)
  const batteryText = computed(() => {
    if (batteryProgress.value !== null) {
      return `${batteryProgress.value}%`
    }
    if (chargingStatus.value?.battery) {
      const b = chargingStatus.value.battery
      return String(b).includes('%') ? String(b) : `${b}%`
    }
    return '0%'
  })

  // Whether the vehicle is charging
  const isCharging = computed(() => {
    if (isChargingSocket.value !== null) {
      return isChargingSocket.value
    }
    if (chargingStatus.value?.isCharging !== undefined) {
      return chargingStatus.value.isCharging === 1
    }
    return false
  })

  // Charging Card Info Object
  const chargingInfo = computed(() => ({
    status: isCharging.value ? t('evCharger.vehicleCharging') : t('evCharger.notCharging'),
    estTime: estimatedTimeText.value,
    battery: batteryText.value
  }))

  const handleViewDetail = () => {
    navigateTo({
      path: '/charging',
      query: {
        chargerCode: chargerCode.value
      }
    })
  }

  const handleAction = (action: any) => {
    navigateTo(action.path)
  }

  const handlePointsClick = () => {
    navigateTo('/membership')
  }

  const handleProfileClick = () => {
    navigateTo('/profile')
  }

  const handlePointsHistory = (event?: Event) => {
    event?.stopPropagation()
    navigateTo({
      path: '/membership',
      query: { tab: 'history' }
    })
  }

  const handlePurchaseHistory = () => {
    navigateTo('/transactionHistory')
  }

  const isStationModalOpen = ref(false)
  const selectedStation = ref<any>(null)

  const route = useRoute()
  const router = useRouter()

  const handleStationClick = (station: any) => {
    selectedStation.value = station
    isStationModalOpen.value = true
    router.push({ hash: '#station-modal' })
  }

  const closeStationModal = () => {
    isStationModalOpen.value = false
    selectedStation.value = null
    if (route.hash === '#station-modal') {
      router.back()
    }
  }

  watch(
    () => route.hash,
    (newHash) => {
      if (newHash !== '#station-modal' && isStationModalOpen.value) {
        isStationModalOpen.value = false
        selectedStation.value = null
      }
    }
  )

  onIonViewWillLeave(() => {
    closeStationModal()
  })

  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    if (target && target.src !== NO_IMAGE_AVAILABLE) {
      target.src = NO_IMAGE_AVAILABLE
    }
  }
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <!-- Profile Card -->
      <AppCard
        class="profile-card"
        bgColor="var(--app-color-default-rg)"
        button="true"
        @click="handleProfileClick"
      >
        <ion-card-content class="profile-card-content">
          <ion-item class="profile-item" lines="none" :detail="false">
            <ion-avatar slot="start" class="profile-avatar">
              <img
                :src="userProfile?.sex || NO_IMAGE_AVAILABLE"
                :alt="userProfile?.fullName"
                @error="handleImageError"
              />
            </ion-avatar>
            <ion-label class="profile-info-label">
              <h2 class="profile-user-name">{{ userProfile?.fullName }}</h2>
              <p class="profile-user-greeting">{{ $t('evCharger.welcome') }}</p>
            </ion-label>
            <ion-icon slot="end" :icon="chevronForward" class="profile-chevron"></ion-icon>
          </ion-item>
        </ion-card-content>
      </AppCard>

      <!-- Charging Card -->
      <AppCard class="ChargingCard charging-active-card" bgColor="var(--app-color-default-rg)">
        <ion-card-content class="charging-card-content">
          <div class="charging-header">
            <div class="charging-status">
              <div class="icon-circle" :class="{ 'is-charging': isCharging }">
                <Icon name="flash" class="flash-icon" />
              </div>
              <span v-if="isCharging" class="status-text">{{ chargingInfo.status }}</span>
            </div>
            <AppButton
              size="small"
              fill="solid"
              class="btn-view-detail"
              v-if="isCharging"
              @click="handleViewDetail()"
            >
              {{ $t('evCharger.viewDetail') }}
            </AppButton>
          </div>
          <div class="charging-body">
            <div class="car-illustration-container">
              <img
                src="/images/blue_ev_charging_station.png"
                alt="Charging EV"
                class="charging-car-image"
              />
            </div>
            <div v-if="isCharging" class="charging-metrics">
              <div class="metric-item">
                <span class="metric-label">{{ $t('evCharger.estTime') }}</span>
                <span class="metric-value time-val">{{ chargingInfo.estTime }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">{{ $t('evCharger.battery') }}</span>
                <span class="metric-value battery-val">{{ chargingInfo.battery }}</span>
              </div>
            </div>
          </div>
        </ion-card-content>
      </AppCard>

      <!-- Points Card -->
      <AppCard
        class="ChargingCard"
        bgColor="var(--app-color-default-rg)"
        customClass="points-card"
        button="true"
        @click="handlePointsClick"
      >
        <img src="/images/Crown.svg" alt="Crown" class="bg-crown" />
        <ion-card-content class="points-card-content">
          <div class="points-header">
            <div class="points-label">{{ $t('evCharger.totalPoints') }}</div>
            <div class="points-value">
              {{ membership?.currentPoint ?? 0 }} {{ $t('evCharger.pts') }}
            </div>
          </div>
          <div class="button-container-right">
            <ion-grid>
              <ion-row>
                <ion-col>
                  <AppButton
                    size="small"
                    fill="solid"
                    expand="block"
                    @click.stop="handlePointsHistory"
                    class="btn-action"
                  >
                    <Icon name="point" class="btn-icon" />
                    {{ $t('evCharger.pointHistory') }}
                  </AppButton>
                </ion-col>
                <ion-col>
                  <AppButton
                    size="small"
                    fill="solid"
                    expand="block"
                    @click="handlePurchaseHistory"
                  >
                    <Icon name="purchase" class="btn-icon" />
                    {{ $t('evCharger.purchaseHistory') }}
                  </AppButton>
                </ion-col>
              </ion-row>
            </ion-grid>
          </div>
        </ion-card-content>
      </AppCard>

      <!-- Action Grid -->
      <ion-grid class="action-grid">
        <ion-row>
          <ion-col v-for="action in actions" :key="action.label">
            <AppCard customClass="action-card" button="true" @click="handleAction(action)">
              <ion-card-content class="action-content">
                <div class="action-icon-wrapper">
                  <Icon :name="action.icon" class="action-icon" size="18px" />
                </div>
                <div class="action-label">
                  {{ action.labelKey ? $t(action.labelKey) : action.label }}
                </div>
              </ion-card-content>
            </AppCard>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Nearby Station Section -->
      <SectionHeader
        :title="$t('evCharger.nearbyStation')"
        @view-all="() => navigateTo('/nearBy_Station')"
      />
      <div class="station-scroll-container">
        <StationCard
          v-for="station in displayedStations"
          :key="station.id"
          :station="station"
          @click="handleStationClick(station)"
        />
      </div>

      <!-- News feed Section -->
      <SectionHeader :title="$t('evCharger.newsFeed')" @view-all="() => navigateTo('/newsFeed')" />

      <ion-card class="news-card" v-for="news in NewFeed" :key="news.id">
        <ion-item lines="none" class="news-item">
          <ion-thumbnail slot="start" class="news-thumbnail">
            <img :alt="news.title" :src="news.image" />
          </ion-thumbnail>
          <ion-label class="ion-text-wrap news-label">
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-desc">{{ news.description }}</p>
          </ion-label>
        </ion-item>
      </ion-card>

      <!-- Station Details Modal -->
      <StationDetailModal
        :is-open="isStationModalOpen"
        :station="selectedStation"
        @close="closeStationModal"
      />
      <!-- <AppButton label="Test" @click="navigateTo('/dashboard')" /> -->
    </ion-content>
    <ion-footer class="scan-QR">
      <div class="scan-QR__container">
        <div class="scan-QR__fab">
          <IconButton
            button-type="qr-code"
            colorScheme="brand"
            style="
              --border-radius: 50%;
              --box-shadow: 0 0 0 6px #ffffff;
              --padding-start: 14px;
              --padding-end: 14px;
              --padding-top: 14px;
              --padding-bottom: 14px;
              --height: 64px;
              font-size: 1.6rem;
            "
            @click="router.push('/qr_scan')"
          />
        </div>
      </div>
    </ion-footer>
  </ion-page>
</template>

<style scoped>
  /* Action Grid Styles */
  .action-grid {
    padding: 0;
    margin-top: 16px;
  }

  .action-card {
    padding: 0;
  }

  /* Horizontal Scroll Container */
  .station-scroll-container {
    display: flex;
    overflow-x: auto;
    gap: 10px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .station-scroll-container::-webkit-scrollbar {
    display: none;
  }

  .ChargingCard {
    padding: 10px;
  }

  .charging-active-card {
    padding: 16px 16px 14px 16px;
    border-radius: 18px;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  .charging-card-content {
    padding: 0;
  }

  /* Charging Card Header */
  .charging-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .charging-status {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .icon-circle {
    width: 28px;
    height: 28px;
    background-color: #4e8c3b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.3s ease;
  }

  .icon-circle.is-charging {
    animation: charging-pulse 1.8s ease-in-out infinite;
  }

  @keyframes charging-pulse {
    0% {
      background-color: #4e8c3b;
      box-shadow: 0 0 0 0 rgba(78, 140, 59, 0.6);
    }
    50% {
      background-color: #6bbd50;
      box-shadow: 0 0 0 6px rgba(78, 140, 59, 0);
    }
    100% {
      background-color: #4e8c3b;
      box-shadow: 0 0 0 0 rgba(78, 140, 59, 0);
    }
  }

  .flash-icon {
    color: #a3e635;
    font-size: 16px;
  }

  .status-text {
    font-size: 15px;
    color: #55647a;
    font-weight: 500;
    letter-spacing: -0.2px;
  }

  .btn-view-detail {
    --border-radius: 11px;
    --background-activated: #c44f06;
    font-weight: 700;
    font-size: 14px;
    margin: 0;
    height: 36px;
    --padding-start: 16px;
    --padding-end: 16px;
  }

  /* Charging Card Body */
  .charging-body {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: 6px;
  }

  .car-illustration-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-end;
  }

  .charging-car-image {
    width: 100%;
    max-width: 270px;
    height: auto;
    object-fit: contain;
    display: block;
    margin-bottom: 2px;
  }

  .charging-metrics {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-shrink: 0;
    padding-bottom: 6px;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .metric-label {
    font-size: 13px;
    color: #8f9dae;
    font-weight: 500;
    white-space: nowrap;
    letter-spacing: -0.1px;
  }

  .metric-value {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.1;
    white-space: nowrap;
    letter-spacing: -0.3px;
  }

  .time-val {
    color: #1e293b;
  }

  .battery-val {
    color: #00a86b;
  }

  ion-card-content {
    padding: 0;
  }

  /* Points Card Styles */
  .points-card {
    position: relative;
    overflow: hidden;
  }
  .bg-crown {
    position: absolute;
    top: -20px;
    right: -10px;
    width: 80px;
    z-index: 0;
  }
  .points-card-content {
    padding: 0;
    position: relative;
    z-index: 1;
  }
  .points-header {
    display: flex;
    flex-direction: column;
  }
  .points-label {
    font-size: 16px;
    color: #7b889a;
    margin-left: 8px;
  }
  .points-value {
    font-size: 28px;
    font-weight: 800;
    color: #2c323f;
    margin-left: 8px;
  }
  .button-container-right {
    display: flex;
    justify-content: flex-end;
  }
  .btn-icon {
    margin-right: 6px;
    font-size: 20px;
  }

  /* Action Card Styles */
  .action-card {
    margin: 0;
    border-radius: 8px;
    box-shadow: none;
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
  }
  .action-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
  .action-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--ion-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }
  .action-icon {
    color: white;
  }
  .action-label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    white-space: nowrap;
  }

  /* News Card Styles */
  .news-card {
    box-shadow: none;
    margin-bottom: 10px;
    padding: 0 !important;
    border-radius: 15px !important;
  }

  .news-item {
    --padding-start: 12px;
    --inner-padding-end: 12px;
    --padding-top: 12px;
    --padding-bottom: 12px;
    --background: transparent;
  }

  .news-thumbnail {
    width: 80px;
    height: 60px;
    margin-top: 0;
    margin-bottom: 0;
    margin-right: 12px;
  }

  .news-thumbnail img {
    border-radius: 8px;
    object-fit: cover;
  }

  .news-label {
    margin: 0;
  }

  .news-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .news-desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Profile Card Styles */
  .profile-card {
    margin-bottom: 12px;
    border-radius: 14px;
    overflow: hidden;
  }

  .profile-card-content {
    padding: 0;
  }

  .profile-item {
    --background: transparent;
    background: transparent;
    --padding-start: 12px;
    --inner-padding-end: 12px;
    --padding-top: 6px;
    --padding-bottom: 6px;
    --inner-padding-top: 0;
    --inner-padding-bottom: 0;
    --min-height: unset;
    min-height: unset;
    cursor: pointer;
  }

  .profile-avatar {
    width: 49px;
    height: 49px;
    margin-top: 0;
    margin-bottom: 0;
    margin-right: 12px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-info-label {
    margin: 0;
  }

  .profile-user-name {
    font-size: 17px;
    font-weight: 800;
    color: #1f242d;
    margin: 0 0 1px 0;
    letter-spacing: -0.2px;
    line-height: 1.2;
  }

  .profile-user-greeting {
    font-size: 13px;
    color: #556070;
    margin: 0;
    font-weight: 400;
    line-height: 1.2;
  }

  .profile-chevron {
    font-size: 19px;
    color: #374151;
    margin-left: 6px;
  }

  /* ion-footer: transparent + allow button to poke out */
  .scan-QR {
    --background: transparent;
    padding: 0;
  }

  /* plain div = full CSS control, no Shadow DOM clipping */
  .scan-QR__container {
    background-color: var(--ion-color-primary);
    display: flex;
    justify-content: center;
    overflow: visible;
    padding-top: 0;
    padding-bottom: 10px;
  }

  /* pull button upward so it floats above the orange bar */
  .scan-QR__fab {
    margin-top: -32px;
  }
</style>
