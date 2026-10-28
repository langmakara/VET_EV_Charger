<script setup lang="ts">
  import { computed } from 'vue'
  import { IonModal, IonContent, IonIcon } from '@ionic/vue'
  import {
    heart,
    heartOutline,
    closeOutline,
    flashOutline,
    locationOutline,
    arrowUpOutline,
    timeOutline,
    checkmarkOutline
  } from 'ionicons/icons'
  import { useRouter } from 'vue-router'
  import Icon from '~/components/Icon/icon.vue'
  import IconButton from '~/components/Button/IconButton.vue'
  import AppButton from '~/components/Button/AppButton.vue'
  import { abaBridge } from '~/composables/useNativeBridge'
  import { useFindStationQuery, useAddFavoritesMutation } from '~/composables/queries'
  import type { StationData, StationDetailData } from '~/api/types'

  const props = defineProps<{
    isOpen: boolean
    station: StationData | StationDetailData | any
  }>()

  const stationId = computed(() => props.station?.id)

  const {
    data: detailResponse,
    isLoading,
    isError,
    error
  } = useFindStationQuery(stationId, {
    enabled: computed(() => props.isOpen && !!stationId.value)
  })

  // Unwrap array from API response (data: [ StationDetailData ]) and merge with props
  const station = computed<Record<string, any>>(() => {
    const raw = (detailResponse.value as any)?.data ?? detailResponse.value?.body?.data
    const apiDetail = Array.isArray(raw) ? raw[0] : raw
    if (apiDetail) {
      return { ...props.station, ...apiDetail }
    }
    return props.station || {}
  })

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  const handleClose = () => {
    emit('close')
  }

  const { mutate: addFavorite, isPending: isAddingFavorite } = useAddFavoritesMutation()

  const isFavorite = computed(() => {
    return Boolean(station.value?.isFavorite ?? station.value?.isFavorites)
  })

  const toggleFavorite = () => {
    const id = station.value?.id
    if (!id || isFavorite.value || isAddingFavorite.value) return

    addFavorite(id, {
      onSuccess: () => {
        if (station.value) {
          station.value.isFavorite = true
        }
        if (props.station) {
          props.station.isFavorite = true
        }
      }
    })
  }

  const openDirection = () => {
    const lat = Number(station.value?.lats)
    const lng = Number(station.value?.longs)
    if (lat && lng) {
      abaBridge.openMap({ lat, lng }).catch(() => {
        // Fallback to web Google Maps if outside mobile app or bridge fails
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        window.open(url, '_blank')
      })
    }
  }

  const router = useRouter()
  const handleScanToCharge = () => {
    // emit('close')
    router.push('/qr_scan')
  }

  const { baseUrl: evChargerBaseUrl } = useApiUrl('/vetEvChargerCustomerAPi', 5697)

  const stationImage = computed(() => {
    const img = station.value?.imageUrl || props.station?.imageUrl
    if (!img) return '/images/station.svg'
    if (img.startsWith('http') || img.startsWith('data:')) return img
    if (
      img.startsWith('/images') ||
      img.startsWith('/icons') ||
      img.startsWith('/vet-ev-charger')
    ) {
      return img
    }
    return `${evChargerBaseUrl}${img.startsWith('/') ? '' : '/'}${img}`
  })

  const franchiseProfile = computed(() => {
    const img = station.value?.franchiseProfileUrl || props.station?.franchiseProfileUrl
    if (!img) return ''
    if (img.startsWith('http') || img.startsWith('data:')) return img
    if (
      img.startsWith('/images') ||
      img.startsWith('/icons') ||
      img.startsWith('/vet-ev-charger')
    ) {
      return img
    }
    return `${evChargerBaseUrl}${img.startsWith('/') ? '' : '/'}${img}`
  })

  const stationCountDisplay = computed(() => {
    return (
      station.value?.isHasCharger ?? 0
    )
  })

  const plugCountDisplay = computed(() => {
    if (station.value?.plugCount != null) return station.value.plugCount
    if (
      station.value?.chargerGuns &&
      Array.isArray(station.value.chargerGuns) &&
      station.value.chargerGuns.length > 0
    ) {
      const available = station.value.chargerGuns.reduce(
        (sum: number, g: any) => sum + (g.qtyAvailable || 0),
        0
      )
      const total = station.value.chargerGuns.reduce((sum: number, g: any) => sum + (g.qty || 0), 0)
      return `${available}/${total}`
    }
    if (station.value?.totalChargerAvailable != null) {
      return `${station.value.totalChargerAvailable}/${station.value.totalCharger || 0}`
    }
    return '0'
  })

  const distanceDisplay = computed(() => {
    if (station.value?.distance) return station.value.distance
    if (station.value?.value) return `${Number(station.value.value).toFixed(1)} km`
    return ''
  })

  const isOpenStatus = computed(() => {
    if (station.value?.isOpen !== undefined) {
      return Boolean(station.value.isOpen)
    }
    if (station.value?.is24Hours === 1) return true
    return true
  })

  const openHoursDisplay = computed(() => {
    if (station.value?.openHour) {
      return station.value.openHour
    }
    if (station.value?.is24Hours === 1) {
      return '24/7'
    }
    if (station.value?.openTime && station.value?.closeTime) {
      return `${station.value.openTime} - ${station.value.closeTime}`
    }
    return station.value?.hours || '24/7'
  })

  const stationConnectors = computed(() => {
    // 1. From chargerGuns (/station/find/{id})
    if (station.value?.chargerGuns && Array.isArray(station.value.chargerGuns)) {
      return station.value.chargerGuns.map((gun: any) => {
        const nameLower = (gun.name || '').toLowerCase()
        const isGbt = nameLower.includes('gb/t') || nameLower.includes('gbt')
        const isCcs2 = nameLower.includes('ccs')
        const icon = isGbt ? 'gbt' : isCcs2 ? '/icons/ccs2DC.svg' : 'plug'

        const power = gun.maxAmperage ? `${gun.maxAmperage} A` : gun.power || ''
        const price =
          gun.pricePerKwh != null ? `${Number(gun.pricePerKwh).toLocaleString()} KHR/kWh` : ''
        const available = gun.qtyAvailable ?? 0
        const total = gun.qty ?? 0
        const status = total > 0 ? `${available}/${total}` : 'Available'
        const isAvailable = available > 0

        return {
          id: gun.chargerGunId,
          name: gun.name,
          icon,
          power,
          price,
          status,
          isAvailable
        }
      })
    }

    // 2. Fallback to connectors from props (mock/legacy)
    if (station.value?.connectors && Array.isArray(station.value.connectors)) {
      return station.value.connectors.map((c: any) => ({
        ...c,
        isAvailable: c.status !== 'In use' && c.status !== 'Unavailable'
      }))
    }

    // 3. Fallback to gunInform from station list
    if (station.value?.gunInform && Array.isArray(station.value.gunInform)) {
      return station.value.gunInform.map((gun: any) => {
        const nameLower = (gun.name || '').toLowerCase()
        const isGbt = nameLower.includes('gb/t') || nameLower.includes('gbt')
        const isCcs2 = nameLower.includes('ccs')
        const icon = isGbt ? 'gbt' : isCcs2 ? '/icons/ccs2DC.svg' : 'plug'
        const price =
          station.value?.pricePerKwh != null
            ? `${Number(station.value.pricePerKwh).toLocaleString()} KHR/kWh`
            : ''

        return {
          id: gun.chargerGunId,
          name: gun.name,
          icon,
          power: '',
          price,
          status: `${gun.qtyAvailable ?? 0}/${gun.qty ?? 0}`,
          isAvailable: (gun.qtyAvailable ?? 0) > 0
        }
      })
    }

    return []
  })

  const operatorName = computed(() => {
    return (
      station.value?.franchiseName ||
      station.value?.companyName ||
      station.value?.operator ||
      'VET EV Charger'
    )
  })

  const stationContacts = computed(() => {
    if (station.value?.contactUs && Array.isArray(station.value.contactUs)) {
      return station.value.contactUs.map((contact: any) => {
        const typeName = (contact.contactTypeName || '').toLowerCase()
        let icon = ''
        let colorClass = 'bg-gray-btn'

        if (typeName.includes('phone') || contact.contactTypeId === 1) {
          icon = 'phone'
          colorClass = 'bg-gray-btn'
        } else if (typeName.includes('telegram') || contact.contactTypeId === 2) {
          icon = 'telegram'
          colorClass = 'bg-transparent'
        } else if (typeName.includes('messenger') || contact.contactTypeId === 3) {
          icon = 'messenger'
          colorClass = 'bg-transparent'
        } else {
          icon = contact.icon || 'phone'
        }

        return {
          id: contact.id,
          name: contact.name,
          link: contact.link,
          icon,
          colorClass
        }
      })
    }

    if (station.value?.contacts && Array.isArray(station.value.contacts)) {
      return station.value.contacts
    }

    return []
  })

  const handleContactClick = (contact: any) => {
    if (!contact?.link) return
    const linkStr = String(contact.link).trim()
    if (linkStr.startsWith('http://') || linkStr.startsWith('https://')) {
      window.open(linkStr, '_blank')
    } else if (linkStr.startsWith('tel:')) {
      window.open(linkStr, '_self')
    } else if (/^\d+$/.test(linkStr.replace(/[\s-+()]/g, ''))) {
      window.open(`tel:${linkStr}`, '_self')
    } else {
      window.open(linkStr, '_blank')
    }
  }

  const stationAmenities = computed(() => {
    const list = station.value?.amenities
    if (!Array.isArray(list)) return []
    return list.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return { id: idx, name: item }
      }
      return {
        id: item.id ?? idx,
        name: item.name ?? item.nameKh ?? ''
      }
    })
  })

  const stationSurroundings = computed(() => {
    const list = station.value?.surroundings
    if (!Array.isArray(list)) return []
    return list.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return { id: idx, name: item }
      }
      return {
        id: item.id ?? idx,
        name: item.name ?? item.nameKh ?? ''
      }
    })
  })
</script>

<template>
  <ion-modal :is-open="isOpen" mode="ios" @didDismiss="handleClose" class="custom-station-modal">
    <ion-content fullscreen class="station-modal-bg">
      <!-- Header Image -->
      <div class="modal-header-image" :style="{ backgroundImage: `url(${stationImage})` }">
        <div class="modal-top-bar">
          <span class="modal-title-overlay">{{ station?.name }}</span>
          <div class="modal-top-actions">
            <button :disabled="isFavorite || isAddingFavorite" class="circle-btn translucent" @click="toggleFavorite">
              <ion-icon
                :icon="isFavorite ? heart : heartOutline"
                :style="{ color: isFavorite ? '#e85d04' : '#ffffff' }"
              />
            </button>
            <button class="circle-btn translucent" @click="handleClose">
              <ion-icon :icon="closeOutline" />
            </button>
          </div>
        </div>
        <div class="modal-header-stats">
          <div class="stat-pill">
            <img src="/icons/Vector.svg" class="stat-icon" style="width: 14px; height: 14px" />
            {{ stationCountDisplay }}
            <span class="stat-divider">|</span>
            <Icon name="plug" class="stat-icon" size="14px" /> {{ plugCountDisplay }}
            <span class="stat-divider">|</span>
            <img src="/icons/way.svg" class="stat-icon" style="width: 14px; height: 14px" />
            {{ distanceDisplay }}
          </div>
        </div>
      </div>

      <div class="modal-body-custom">
        <!-- Title & Subtitle -->
        <div class="station-title-row">
          <div class="logo-circle bg-orange">
            <span class="logo-text">
              <img v-if="franchiseProfile" :src="franchiseProfile" :alt="station?.name" />
              <span v-else>{{ (operatorName || 'V')[0] }}</span>
            </span>
          </div>
          <div class="title-text">
            <h2>{{ station?.name }}</h2>
            <p>
              {{ station?.companyName || station?.franchiseName || station?.type || 'EV Station' }}
            </p>
          </div>
        </div>

        <!-- Location Pill -->
        <div class="location-pill" @click="openDirection" style="cursor: pointer">
          <ion-icon :icon="arrowUpOutline" class="loc-icon" />
          <span>{{
            station?.address || 'Address unavailable'
          }}</span>
        </div>

        <!-- Charge Point Info -->
        <div class="section-heading">Charge Point Info</div>

        <!-- Open Status Card -->
        <div class="info-card flex-row status-card">
          <ion-icon :icon="timeOutline" class="clock-icon" />
          <span class="status-text">
            <span :class="isOpenStatus ? 'text-green' : 'text-danger'">{{
              isOpenStatus ? 'Open' : 'Close'
            }}</span>
            {{ openHoursDisplay }}
          </span>
        </div>

        <!-- Detailed Chargers Card -->
        <div class="info-card chargers-card">
          <template v-for="(connector, index) in stationConnectors" :key="connector.id || index">
            <div class="connector-row">
              <div class="connector-left">
                <div class="connector-icon-wrapper">
                  <img
                    v-if="connector.icon && connector.icon.includes('.svg')"
                    :src="connector.icon"
                    style="width: 24px; height: 24px"
                  />
                  <Icon v-else-if="connector.icon" :name="connector.icon" size="24px" />
                  <Icon v-else name="plug" size="24px" />
                </div>
                <span class="connector-name">{{ connector.name }}</span>
              </div>
              <div class="connector-mid">
                <div class="power-info" v-if="connector.power">
                  <ion-icon :icon="flashOutline" /> {{ connector.power }}
                </div>
                <div class="price-info" v-if="connector.price">
                  <ion-icon :icon="flashOutline" /> {{ connector.price }}
                </div>
              </div>
              <div class="connector-right">
                <span :class="connector.isAvailable ? 'text-orange' : 'text-danger'">{{
                  connector.status
                }}</span>
              </div>
            </div>
            <div v-if="index !== stationConnectors.length - 1" class="hr-divider"></div>
          </template>

          <div v-if="stationConnectors.length > 0" class="hr-divider"></div>

          <!-- Operator & Actions -->
          <div class="operator-row">
            <div class="operator-left">
              <div class="logo-circle small-logo bg-orange">
                <span class="logo-text-small">
                  <img v-if="franchiseProfile" :src="franchiseProfile" :alt="operatorName" />
                  <span v-else>{{ (operatorName || 'V')[0] }}</span>
                </span>
              </div>
              <div class="operator-info">
                <span class="op-label">Operated by</span>
                <span class="op-name">{{ operatorName }}</span>
              </div>
            </div>
            <div class="operator-actions">
              <button
                v-for="(contact, index) in stationContacts"
                :key="contact.id || index"
                :class="['action-circle', contact.colorClass]"
                :title="contact.name"
                @click="handleContactClick(contact)"
              >
                <img
                  v-if="contact.icon && contact.icon.includes('.svg')"
                  :src="contact.icon"
                  style="width: 100%; height: 100%; border-radius: 50%"
                />
                <Icon
                  v-else-if="contact.icon"
                  :name="contact.icon"
                  :size="contact.icon === 'phone' ? '16px' : '32px'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Amenities -->
        <div class="section-heading" v-if="stationAmenities.length > 0">Amenities</div>
        <div class="info-card amenities-card" v-if="stationAmenities.length > 0">
          <div class="amenities-grid">
            <div
              class="amenity-item"
              v-for="(amenity, index) in stationAmenities"
              :key="amenity.id || index"
            >
              <ion-icon :icon="checkmarkOutline" class="text-green check-icon" /> {{ amenity.name }}
            </div>
          </div>
        </div>

        <!-- Surroundings -->
        <div class="section-heading" v-if="stationSurroundings.length > 0">Surroundings</div>
        <div
          class="info-card flex-between surroundings-card"
          v-for="(surrounding, index) in stationSurroundings"
          :key="surrounding.id || index"
        >
          <div class="amenity-item">
            <ion-icon :icon="checkmarkOutline" class="text-green check-icon" />
            {{ surrounding.name }}
          </div>
        </div>
      </div>

      <!-- Fixed Bottom Action Bar -->
      <div slot="fixed" class="bottom-action-bar">
        <IconButton
          buttonType="direction"
          color="light"
          size="lg"
          @click="openDirection"
        />
        <AppButton
          class="scan-charge-btn"
          expand="block"
          @click="handleScanToCharge"
        >
          <template #start>
            <Icon name="scan-charge" size="22px" class="scan-btn-icon" />
          </template>
          Scan to Charge
        </AppButton>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
  /* Custom Modal Styles for New Design */
  .custom-station-modal {
    --border-radius: 20px 20px 0 0;
    padding: 0;
  }
  .station-modal-bg {
    --background: #f8fafc;
    --padding-top: 0px;
    --padding-bottom: 0px;
    --padding-start: 0px;
    --padding-end: 0px;
  }

  /* Fixed Bottom Action Bar */
  .bottom-action-bar,
  .direction-fab {
    padding: 10px;
    padding-left: 20px;
    padding-right: 20px;
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10;
  }
  .scan-charge-btn {
    flex: 1;
    height: 52px;
    min-height: 52px;
    margin: 0;
    --background: linear-gradient(135deg, #f95700 0%, #ea580c 100%);
    --background-hover: #e04f00;
    --background-activated: #d44800;
    --color: #ffffff;
    --border-radius: 22px;
    --box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);
    font-weight: 700;
    font-size: 16px;
  }
  .scan-charge-btn::part(native) {
    border-radius: 22px;
    background: linear-gradient(135deg, #f95700 0%, #ea580c 100%);
    box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);
    font-weight: 700;
    letter-spacing: 0.2px;
  }
  .scan-btn-icon {
    margin-right: 8px;
    display: flex;
    align-items: center;
  }

  .modal-header-image {
    position: relative;
    width: 100%;
    height: 220px;
    background-size: cover;
    background-position: center;
  }
  .modal-top-bar {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-title-overlay {
    color: white;
    font-size: 18px;
    font-weight: 600;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
  .modal-top-actions {
    display: flex;
    gap: 8px;
  }
  .circle-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    color: white;
    font-size: 18px;
  }
  .circle-btn.translucent {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(4px);
  }
  .modal-header-stats {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }
  .stat-pill {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    color: white;
    border-radius: 16px;
    padding: 6px 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .stat-icon {
    font-size: 14px;
  }
  .stat-divider {
    color: rgba(255, 255, 255, 0.4);
  }
  .modal-body-custom {
    padding: 10px;
    padding-bottom: 100px; /* extra space so the fixed button never covers the last card */
    background: #f8fafc;
  }
  .station-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .logo-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }

  .logo-text {
    font-size: 16px;
  }
  .logo-text-small {
    font-size: 12px;
  }
  .small-logo {
    width: 36px;
    height: 36px;
  }
  .title-text h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #1e293b;
  }
  .title-text p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }
  .location-pill {
    background: white;
    border-radius: 20px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }
  .loc-icon {
    font-size: 18px;
    color: #64748b;
  }
  .section-heading {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 12px;
    margin-left: 4px;
  }
  .info-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }
  .flex-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .clock-icon {
    font-size: 20px;
    color: #64748b;
  }
  .status-text {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
  }
  .text-green {
    color: #10b981;
  }
  .text-orange {
    color: #e85d04;
    font-weight: 700;
  }
  .connector-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .connector-left {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 45%;
  }
  .connector-icon-wrapper {
    color: #1e293b;
  }
  .connector-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
  .connector-mid {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 35%;
  }
  .power-info,
  .price-info {
    font-size: 12px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .connector-right {
    font-size: 15px;
    width: 20%;
    text-align: right;
  }
  .hr-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 16px 0;
  }
  .operator-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .operator-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .operator-info {
    display: flex;
    flex-direction: column;
  }
  .op-label {
    font-size: 11px;
    color: #94a3b8;
  }
  .op-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
  .operator-actions {
    display: flex;
    gap: 8px;
  }
  .action-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    color: white;
    font-size: 16px;
  }
  .bg-gray-btn {
    background: #f1f5f9;
    color: #1e293b;
    border: 1px solid #e2e8f0;
  }
  .bg-blue-btn {
    background: #0ea5e9;
  }
  .bg-messenger-btn {
    background: #3b82f6;
  }
  .bg-transparent {
    background: transparent;
  }
  .amenities-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .amenity-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #334155;
  }
  .check-icon {
    font-size: 16px;
  }
  .flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
