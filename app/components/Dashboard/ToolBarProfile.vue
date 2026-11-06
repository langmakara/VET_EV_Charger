<template>
  <div class="profile-workspace">
    <!-- Profile Display Grid -->
    <div v-if="userProfile" class="profile-card">
      <h3>Welcome, {{ userProfile.firstName }} {{ userProfile.lastName }}</h3>
      <ul>
        <li><strong>Full Name:</strong> {{ userProfile.fullName || 'N/A' }}</li>
        <li><strong>Phone Number:</strong> {{ userProfile.phone }}</li>
        <li><strong>Nationality:</strong> {{ userProfile.nationality }}</li>
        <li><strong>Dob Short:</strong> {{ userProfile.dobShort }}</li>
        <li><strong>App Version:</strong> {{ userProfile.appVersion }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useABAMiniApp } from '@/composables/useNativeBridge'
  const { userProfile } = useABAMiniApp()
</script>

<style scoped>
  .profile-workspace {
    padding: 16px;
  }
  button {
    background: #005b82;
    color: #fff;
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .profile-card {
    margin-top: 16px;
    padding: 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 8px;
    font-size: 14px;
  }
</style>
