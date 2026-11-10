<script setup lang="ts">
import { ref, watch } from 'vue'
import { IonPage } from '@ionic/vue'
import LoadingPage from '~/components/loading/loadingPage.vue'
import { useSendProfile, getIsNewAbaUser } from '~/composables/useSendProfile'

const { authToken, authResponse } = useSendProfile()
const isDataLoaded = ref(false)

// Watch API auth token reception
watch(
  [() => authToken.value, () => authResponse.value],
  ([token, auth]) => {
    const resAny = auth as any
    const body = resAny?.body
    if (token || body?.accessToken || body?.token || resAny?.data?.accessToken || resAny?.data?.token) {
      isDataLoaded.value = true
    }
  },
  { immediate: true }
)

/**
 * Handle loading completion from root:
 * - If newAbaUser is true: navigate to Terms of Service page (/termsofService)
 * - If newAbaUser is false: navigate to EV Charger home page (/ev_charger)
 */
const handleLoadingComplete = (payload?: { newAbaUser?: boolean }) => {
  const isNew = typeof payload?.newAbaUser === 'boolean' ? payload.newAbaUser : getIsNewAbaUser()
  if (isNew) {
    navigateTo('/termsofService', { replace: true })
  } else {
    navigateTo('/ev_charger', { replace: true })
  }
}
</script>

<template>
  <ion-page>
    <LoadingPage
      :is-loaded="isDataLoaded"
      @complete="handleLoadingComplete"
    />
  </ion-page>
</template>

<style scoped>
</style>
