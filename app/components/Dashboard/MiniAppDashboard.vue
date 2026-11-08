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
        <div class="input-row">
          <input
            v-model="accountAmount"
            type="text"
            placeholder="Amount (e.g. 10000)"
          />
          <select v-model="accountCurrency">
            <option value="KHR">KHR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button @click="fetchUserRoutingDetails">Query Default Account (API #2)</button>
        <div v-if="activeAccount" class="meta-display">
          <p><strong>Account Name:</strong> {{ activeAccount.accountName }}</p>
          <p><strong>Account Number:</strong> {{ activeAccount.accountNumber }}</p>
          <p><strong>Currency:</strong> {{ activeAccount.currency }}</p>
        </div>
        <div v-else-if="accountChecked" class="meta-display">
          <p><em>No default account returned (possibly insufficient balance or unavailable).</em></p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useDeviceLocation } from '@/composables/useNativeBridge'
  import {
    ABABridgeService,
    type ABADefaultAccResponse,
    type ABAGetDefaultAccPayload
  } from '@/services/abaBridge'

  const activeAccount = ref<ABADefaultAccResponse | null>(null)
  const accountChecked = ref(false)
  const accountAmount = ref('10000')
  const accountCurrency = ref<'KHR' | 'USD'>('KHR')
  const { currentCoordinates, isHardwareScanning, triggerHardwareSync } = useDeviceLocation()

  const fetchUserRoutingDetails = async () => {
    accountChecked.value = false
    try {
      // API #2: Get Default Account with required payload: { currency: "USD" | "KHR", amount: "xxx" }
      const payload: ABAGetDefaultAccPayload = {
        currency: accountCurrency.value,
        amount: accountAmount.value
      }
      const response = await ABABridgeService.getDefaultAcc(payload)
      activeAccount.value = response
      accountChecked.value = true
    } catch (error) {
      console.error('Failed processing target default user account parsing logic:', error)
      activeAccount.value = null
      accountChecked.value = true
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
  .input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .input-row input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 14px;
  }
  .input-row select {
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 14px;
  }
</style>
