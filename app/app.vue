<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { IonApp, IonRouterOutlet } from '@ionic/vue'
  import { callHandler } from 'web-bridge-gateway'
  import { useABAMiniApp } from '@/composables/useNativeBridge'

  const router = useRouter()
  const { setBarTitle, getProfile } = useABAMiniApp()
  const { t, locale } = useI18n()

  const ROUTE_TITLE_MAP: Record<string, string> = {
    '/': 'titles.vetEvCharger',
    '/ev_charger': 'titles.vetEvCharger',
    '/qr_scan': 'titles.qrScan',
    '/chargingInfor': 'titles.chargingInfor',
    '/charging': 'titles.charging',
    '/charging_history': 'titles.chargingHistory',
    '/membership': 'titles.membership',
    '/membership/membershipBenefit': 'titles.membershipBenefit',
    '/profile': 'titles.profile',
    '/profile/profileDetail': 'titles.profileDetail',
    '/ev_charger/mapStations': 'titles.mapStations',
    '/ev_charger/favorites': 'titles.favorites',
    '/ev_charger/voucher': 'titles.voucher',
    '/nearBy_Station': 'titles.nearByStation',
    '/newsFeed': 'titles.newsFeed',
    '/session_summary': 'titles.sessionSummary',
    '/faq': 'titles.faq',
    '/terms': 'titles.terms',
    '/termsofService': 'titles.termsOfService',
    '/transactionHistory': 'titles.transactionHistory',
    '/unauthorized': 'titles.unauthorized'
  }

  const updateDynamicTitle = (path?: string) => {
    const rawPath = path || router.currentRoute.value.path || '/'
    // Strip subpath prefixes (e.g. /vet-ev-charger/qr_scan -> /qr_scan)
    const normalizedPath = rawPath.replace(/^\/vet-ev-charger(?=\/|$)/, '') || '/'
    const titleKey =
      ROUTE_TITLE_MAP[rawPath] ||
      ROUTE_TITLE_MAP[normalizedPath] ||
      'titles.vetEvCharger'

    const translatedTitle = t(titleKey)

    setBarTitle({
      title: translatedTitle,
      bgColor: '#DE5D0A',
      color: '#ffffff'
    })
  }

  // 1. Update title whenever the route changes
  router.afterEach((to) => {
    updateDynamicTitle(to.path)
  })

  // 2. Update title when language/locale switches
  watch(locale, () => {
    updateDynamicTitle()
  })

  onMounted(async () => {
    // 1. Fetch once at startup
    try {
      await getProfile()
    } catch (err) {
      console.error('Failed to get user profile', err)
    }

    router.isReady().then(() => {
      updateDynamicTitle()
    })

    window.onpopstate = () => {
      if (window.history.state?.back === null || router.currentRoute.value.path === '/') {
        callHandler('backToHomePage')
      }
    }
  })
</script>
