<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
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

  import evChargerData from '~/data/ev_charger_data.json'
  import IconButton from '~/components/Button/IconButton.vue'
import { useStationInfinite } from '~/composables/queries/useStation.ts'
import type { StationData } from '~/api/types.ts'

  const { actions, nearbyStations, newsFeeds, profile } = evChargerData

  const chargingInfo = ref({
    status: 'Your vehicle is charging',
    estTime: '24 mins',
    battery: '70%'
  })

  const { userProfile } = useUserProfile()

  const user = computed(() => ({
    fullName: userProfile.value?.fullName,
    email: userProfile.value?.email,
    address: userProfile.value?.address,
    phoneNumber: userProfile.value?.phoneNumber,
    avatar: userProfile.value?.avatar || profile.avatar
  }))

  // Reactive query parameters (filter payload for POST /station/list)
const filter = ref({
  rowsPerPage: 5,
  lats: 11.556374,
  longs: 104.928207,
})

  const {data, isLoading, isError} = useStationInfinite(filter)

  // Flatten all pagination pages
  const rawStations = computed<StationData[]>(() => {
    return (
      data.value?.pages.flatMap((page) => {
        const res = (page as any)?.data ?? page?.body?.data
        return Array.isArray(res) ? res : res?.list ?? []
      }) ?? []
    )
  })

  // Filter by lat and lng

  const isCharging = computed(() => {
    const status = chargingInfo.value.status?.toLowerCase() || ''
    return status === 'charging' || status.includes('charging')
  })

  const handleViewDetail = () => {
    navigateTo('/charging')
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
    navigateTo('/charging_history')
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
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <!-- Profile Card -->
      <AppCard
        class="profile-card"
        bgColor="linear-gradient(135deg, #f8ede6 0%, #ead3c7 100%)"
        button="true"
        @click="handleProfileClick"
      >
        <ion-card-content class="profile-card-content">
          <ion-item class="profile-item" lines="none" :detail="false">
            <ion-avatar slot="start" class="profile-avatar">
              <img :src="user.avatar" :alt="user.fullName" />
            </ion-avatar>
            <ion-label class="profile-info-label">
              <h2 class="profile-user-name">{{ user.fullName }}</h2>
              <p class="profile-user-greeting">Wellcome</p>
            </ion-label>
            <ion-icon slot="end" :icon="chevronForward" class="profile-chevron"></ion-icon>
          </ion-item>
        </ion-card-content>
      </AppCard>

      <!-- Charging Card -->
      <AppCard
        class="ChargingCard charging-active-card"
        bgColor="linear-gradient(135deg, #f7eee6 0%, #ebdad0 100%)"
      >
        <ion-card-content class="charging-card-content">
          <div class="charging-header">
            <div class="charging-status">
              <div class="icon-circle" :class="{ 'is-charging': isCharging }">
                <Icon name="flash" class="flash-icon" />
              </div>
              <span class="status-text">{{ chargingInfo.status }}</span>
            </div>
            <AppButton
              size="small"
              fill="solid"
              class="btn-view-detail"
              @click="handleViewDetail()"
            >
              View Detail
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
            <div class="charging-metrics">
              <div class="metric-item">
                <span class="metric-label">Est. Time</span>
                <span class="metric-value time-val">{{ chargingInfo.estTime }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Battery</span>
                <span class="metric-value battery-val">{{ chargingInfo.battery }}</span>
              </div>
            </div>
          </div>
        </ion-card-content>
      </AppCard>

      <!-- Points Card -->
      <AppCard
        class="ChargingCard"
        bgColor="linear-gradient(135deg, #f8e9e1, #ead1c5)"
        customClass="points-card"
        button="true"
        @click="handlePointsClick"
      >
        <img src="/images/Crown.svg" alt="Crown" class="bg-crown" />
        <ion-card-content class="points-card-content">
          <div class="points-header">
            <div class="points-label">Total Points</div>
            <div class="points-value">190 pts</div>
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
                    Point History
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
                    Purchase History
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
                <div class="action-label">{{ action.label }}</div>
              </ion-card-content>
            </AppCard>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Nearby Station Section -->
      <SectionHeader title="Nearby Station" @view-all="() => navigateTo('/nearBy_Station')" />
      <div class="station-scroll-container">
        <StationCard
          v-for="station in nearbyStations.slice(0, 5)"
          :key="station.id"
          :station="station"
          @click="handleStationClick(station)"
        />
      </div>

      <!-- News feed Section -->
      <SectionHeader title="News feed" @view-all="() => navigateTo('/newsFeed')" />

      <ion-card class="news-card" v-for="news in newsFeeds" :key="news.id">
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
    background-color: #e85d04;
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
