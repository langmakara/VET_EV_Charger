<!-- components/MiniAppDashboard.vue -->
<template>
  <div class="aba-mini-app-container">
    <header class="app-banner">
      <h1>ABA Mini-App Workspace</h1>
    </header>

    <main class="action-grid">
      <!-- Location Service Block -->
      <section class="card">
        <h3>Device Localization</h3>
        <button :disabled="isHardwareScanning" @click="triggerHardwareSync">
          {{ isHardwareScanning ? 'Scanning GPS...' : 'Fetch Device Location' }}
        </button>
        <div v-if="currentCoordinates" class="meta-display">
          <p><strong>Lat:</strong> {{ currentCoordinates.latitude }}</p>
          <p><strong>Lng:</strong> {{ currentCoordinates.longitude }}</p>
        </div>
      </section>

      <!-- Secure User Scope Profile Data Block -->
      <section class="card">
        <h3>User Context Bank Verification</h3>
        <button @click="fetchUserRoutingDetails">Query Pre-Selected Account Schema</button>
        <div v-if="activeAccount" class="meta-display">
          <p><strong>Acc Number:</strong> {{ activeAccount.accountNumber }}</p>
          <p><strong>Currency:</strong> {{ activeAccount.currency }}</p>
          <p><strong>Balance:</strong> {{ activeAccount.balanceMasked }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useDeviceLocation } from '@/composables/useNativeBridge'
  import { ABABridgeService, type ABAAccountData } from '@/services/abaBridge'

  const activeAccount = ref<ABAAccountData | null>(null)
  const { currentCoordinates, isHardwareScanning, triggerHardwareSync } = useDeviceLocation()

  const fetchUserRoutingDetails = async () => {
    try {
      // Native Context Hook: Requests current validated account parameter blocks from user session
      const response = await ABABridgeService.invokeNative<ABAAccountData>('getDefaultAcc', {})
      activeAccount.value = response
    } catch (error) {
      console.error('Failed processing target default user account parsing logic:', error)
    }
  }
</script>

<style scoped>
  .aba-mini-app-container {
    font-family: sans-serif;
    padding: 16px;
    background: #f4f6f9;
  }
  .card {
    background: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    border: 1px solid #e2e8f0;
  }
  button {
    background: #005b82;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  button:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
  .meta-display {
    margin-top: 12px;
    font-size: 14px;
    background: #f8fafc;
    padding: 8px;
    border-radius: 4px;
  }
</style>
