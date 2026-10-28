<script setup lang="ts">
  import { computed } from 'vue'
import {
  IonCard,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonText
} from '@ionic/vue'
import Icon from '~/components/Icon/icon.vue'
import IconButton from '../Button/IconButton.vue'
import type { StationData } from '~/api/types'

const props = withDefaults(
  defineProps<{
    station: StationData
    address?: boolean | string
    price?: boolean | string
    mode?: 'address' | 'price' | string
    heart?: boolean | string
    status?: boolean | string
    customClass?: string
  }>(),
  {
    address: false,
    price: false,
    mode: '',
    heart: false,
    status: false,
    customClass: ''
  }
)

const showAddress = computed(() => {
  return (
    props.address === true ||
    props.address === '' ||
    props.address === 'true' ||
    props.mode === 'address'
  )
})

const showPrice = computed(() => {
  if (
    props.price === true ||
    props.price === '' ||
    props.price === 'true' ||
    props.mode === 'price'
  ) {
    return true
  }
  // If address is explicitly enabled and price wasn't specified, hide price
  if (showAddress.value) {
    return false
  }
  // Default fallback: show price
  return true
})

const showHeart = computed(() => {
  return (
    props.heart === true ||
    props.heart === '' ||
    props.heart === 'true'
  )
})

const showStatus = computed(() => {
  if (
    props.status === true ||
    props.status === '' ||
    props.status === 'true'
  ) {
    return true
  }
  // If heart is explicitly enabled and status wasn't specified, hide status
  if (showHeart.value) {
    return false
  }
  // Default fallback: show status
  return true
})

const emit = defineEmits(['favorite-click', 'toggle-favorite'])

const isFavorite = computed(() => {
  return Boolean(props.station?.isFavorite ?? (props.station as any)?.isFavorites)
})

const { baseUrl: evChargerBaseUrl } = useApiUrl('/vetEvChargerCustomerAPi', 5697)

const stationImage = computed(() => {
  const img = props.station?.imageUrl || (props.station as any)?.station
  if (!img) return '/images/station.svg'
  if (img.startsWith('http') || img.startsWith('data:')) return img
  if (img.startsWith('/images') || img.startsWith('/icons') || img.startsWith('/vet-ev-charger')) {
    return img
  }
  return `${evChargerBaseUrl}${img.startsWith('/') ? '' : '/'}${img}`
})

const isOpen = computed(() => {
  if (props.station?.isOpen !== undefined) {
    return Boolean(props.station.isOpen)
  }
  return (props.station as any)?.status === 'Open' || (props.station as any)?.status === 'open'
})

const statusLabel = computed(() => {
  return isOpen.value ? 'Open' : 'Close'
})

const formattedPrice = computed(() => {
  if (props.station?.pricePerKwh != null) {
    return `${Number(props.station.pricePerKwh).toLocaleString()} KHR/kWh`
  }
  return (props.station as any)?.price || ''
})

const gbtInfo = computed(() => {
  const gun = props.station?.gunInform?.find((g) => g.name?.includes('GB/T'))
  if (gun) {
    return `${gun.qtyAvailable}/${gun.qty}`
  }
  return (props.station as any)?.gbt || (props.station as any)?.qty || '0/0'
})

const ccs2Info = computed(() => {
  const gun = props.station?.gunInform?.find((g) => g.name?.includes('CCS2'))
  if (gun) {
    return `${gun.qtyAvailable}/${gun.qty}`
  }
  return (props.station as any)?.ccs2 || '0/0'
})

const distanceText = computed(() => {
  if ((props.station as any)?.distance) {
    return (props.station as any).distance
  }
  if (props.station?.value) {
    return `${Number(props.station.value).toFixed(1)} km`
  }
  return ''
})
</script>

<template>
  <ion-card :class="['station-card', customClass]" style="background: #f8fafc">
    <ion-item lines="none" class="station-item">
      <ion-thumbnail slot="start" class="station-thumbnail">
        <img :src="stationImage" :alt="station.name" />
      </ion-thumbnail>

      <ion-label class="station-info ion-text-wrap">
        <ion-grid class="info-grid">
          <ion-row class="info-header ion-align-items-center ion-justify-content-between">
            <ion-col size="8">
              <ion-text color="dark">
                <h3 class="station-name">{{ station.name }}</h3>
              </ion-text>
            </ion-col>
            <ion-col class="status" size="4">
              <ion-text
                v-if="showStatus"
                :color="isOpen ? 'success' : 'danger'"
                class="station-status"
              >
                • {{ statusLabel }}
              </ion-text>
              <IconButton
                v-if="showHeart"
                name="heart"
                size="20px"
                class="heart-btn"
                :color="isFavorite ? 'primary' : 'medium'"
              />
            </ion-col>
          </ion-row>

          <ion-row v-if="showPrice" class="info-row">
            <ion-col size="12" class="info-item">
              <Icon name="dollar" class="info-icon" size="14px" />
              <ion-text class="highlight">{{ formattedPrice }}</ion-text>
            </ion-col>
          </ion-row>

          <ion-row v-if="showAddress" class="info-row">
            <ion-col size="12" class="info-item">
              <ion-text class="highlight"># {{ station.address }}</ion-text>
            </ion-col>
          </ion-row>


          <ion-row class="info-row">
            <ion-col size="4" size-md="4" size-lg="4" class="info-item">
              <Icon name="gbt" class="info-icon" size="14px" />
              <ion-text color="medium">GB/T </ion-text>
              <ion-text class="highlight">{{ gbtInfo }}</ion-text>
            </ion-col>
            <ion-col size="8" size-md="8" size-lg="8" class="info-item">
              <img src="/icons/ccs2DC.svg" class="info-icon" style="width: 14px; height: 14px" />
              <ion-text color="medium">CCS2 (DC) </ion-text>
              <ion-text class="highlight">{{ ccs2Info }}</ion-text>
            </ion-col>
          </ion-row>

          <ion-row class="info-row location-row ion-align-items-center" style="width: 100%">
            <ion-col
              size="auto"
              class="info-item location-item"
              style="display: flex; align-items: center; padding: 0"
            >
              <Icon
                name="location"
                class="location-icon"
                size="14px"
                style="margin-right: 4px; display: flex"
              />
              <ion-text color="primary" class="location-text" style="line-height: 1"
                >Get Direction</ion-text
              >
            </ion-col>
            <ion-col style="display: flex; align-items: center; padding: 0">
              <ion-text color="medium" class="distance-text" style="line-height: 1">{{
                distanceText
              }}</ion-text>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-label>
    </ion-item>
  </ion-card>
</template>

<style scoped>
  .station-card {
    width: 360px;
    min-width: 330px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: none;
    margin: 0;
    padding: 0 !important;
    overflow: hidden;
  }

  .station-item {
    --padding-start: 0;
    --inner-padding-end: 0;
    --padding-top: 0;
    --padding-bottom: 0;
    --background: transparent;
    --min-height: 120px;
  }

  .station-thumbnail {
    width: 100px;
    height: 120px;
    margin: 0;
  }

  .station-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }

  .station-info {
    margin: 0;
    height: 120px;
  }

  .info-grid {
    padding: 5px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    --ion-grid-padding: 0;
    --ion-grid-column-padding: 0;
  }

  ion-col {
    padding: 0;
  }

  .info-header {
    margin-bottom: 4px;
  }

  .station-name {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .station-status {
    font-size: 12px;
    font-weight: 600;
  }
  .status {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }
  .heart-btn {
    cursor: pointer;
    --color: #e85d04;
  }

  .info-row {
    font-size: 11px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 0;
  }

  .info-icon {
    color: #64748b;
    min-width: 12px;
    min-height: 12px;
  }

  .highlight {
    color: #e85d04;
    font-size: 12px;
  }

  .location-row {
    margin-top: auto;
    gap: 4px;
  }

  .location-item {
    cursor: pointer;
  }

  .location-icon {
    color: #3b82f6;
  }

  .location-text {
    font-weight: 500;
    color: #3b82f6;
  }

  .distance-text {
    font-size: 11px;
  }
</style>
