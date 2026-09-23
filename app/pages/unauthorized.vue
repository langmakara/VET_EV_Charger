<script setup lang="ts">
import { useAssetResolver } from "~/composables/useAssetResolver";

definePageMeta({
  layout: false,
})

const route = useRoute()
const isLoginFailed = computed(() => route.query.reason === 'login_failed')
const { resolveAsset } = useAssetResolver()
</script>

<template>
  <div class="unauthorized-container">
    <div class="unauthorized-card">
      <div class="icon-wrapper" :class="{ error: isLoginFailed, 'logo-container': !isLoginFailed }">
        <svg v-if="isLoginFailed" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <img v-else :src="resolveAsset('images/logo.jpg')" alt="VET Car Rental Logo" class="logo-img" />
      </div>

      <h1 v-if="isLoginFailed">Your Account Can't Open Mini App</h1>
      <h1 v-else>Open from Mobile App</h1>

      <p v-if="isLoginFailed">Your account is not authorized or allowed to access this mini app.</p>
      <p v-else>This mini app is only available when launched from the <strong>VET Experess</strong> mobile application.</p>

      <p class="hint" v-if="isLoginFailed">Please log in with an authorized account or contact support.</p>
      <p class="hint" v-else>Please open this page through the app to continue.</p>
    </div>
  </div>
</template>

<style scoped>
.unauthorized-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0b0f19;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.unauthorized-card {
  max-width: 400px;
  width: 100%;
  text-align: center;
  background: #161f30;
  border: 1px solid #26334d;
  border-radius: 16px;
  padding: 40px 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(0, 220, 130, 0.1);
  color: #00dc82;
  margin-bottom: 24px;
}

.icon-wrapper.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon-wrapper.logo-container {
  background: transparent;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

h1 {
  font-size: 1.4rem;
  color: #f8fafc;
  margin-bottom: 12px;
}

p {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 8px;
}

.hint {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 16px;
}
</style>
