<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { IonApp, IonRouterOutlet } from '@ionic/vue'
  import { callHandler } from 'web-bridge-gateway'
  import { useABAMiniApp } from '@/composables/useNativeBridge'

  const router = useRouter()
  const { setBarTitle, getProfile } = useABAMiniApp()

  onMounted(async () => {
    // 1. Fetch once at startup
    try {
      await getProfile()
    } catch (err) {
      console.error('Failed to get user profile', err)
    }

    setBarTitle({
      title: 'My Store',
      bgColor: '#005A9C',
      color: '#ffffff'
    })

    window.onpopstate = () => {
      if (window.history.state?.back === null || router.currentRoute.value.path === '/') {
        callHandler('backToHomePage')
      }
    }
  })
</script>
