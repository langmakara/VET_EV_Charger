<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonModal,
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  closeOutline,
  copyOutline,
  checkmarkOutline,
  refreshOutline,
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    handlerName?: string
    requestPayload?: any
    response?: any // Profile data from ABA Mobile App
    authResponse?: any // Response from useSendProfile (Auth Token API)
    authPayload?: any // Payload sent to useSendProfile API
    apiUrl?: string // Full API URL (e.g. POST .../aba-mini-app/auth/token)
    apiMethod?: string // e.g. 'POST'
    error?: any
    authError?: any
    isLoading?: boolean
    isAuthLoading?: boolean
  }>(),
  {
    isOpen: false,
    handlerName: 'getProfile',
    requestPayload: null,
    response: null,
    authResponse: null,
    authPayload: null,
    apiUrl: '',
    apiMethod: 'POST',
    error: null,
    authError: null,
    isLoading: false,
    isAuthLoading: false
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

type ActiveTab = 'profile' | 'apiPayload' | 'apiResponse' | 'bridgePayload'
const activeTab = ref<ActiveTab>('profile')
const copied = ref(false)
const urlCopied = ref(false)

// Auto-switch to API Response tab if authResponse exists and profile is empty
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if ((props.authResponse || props.authError) && !props.response) {
        activeTab.value = 'apiResponse'
      }
    }
  },
  { immediate: true }
)

const formattedResponse = computed(() => {
  if (props.error) {
    return typeof props.error === 'object'
      ? JSON.stringify(props.error, Object.getOwnPropertyNames(props.error), 2)
      : String(props.error)
  }
  if (props.response !== null && props.response !== undefined) {
    return typeof props.response === 'object'
      ? JSON.stringify(props.response, null, 2)
      : String(props.response)
  }
  return '// No profile response received from ABA Mobile app yet'
})

const formattedAuthPayload = computed(() => {
  if (props.authPayload !== null && props.authPayload !== undefined) {
    return typeof props.authPayload === 'object'
      ? JSON.stringify(props.authPayload, null, 2)
      : String(props.authPayload)
  }
  return '// No API payload available yet'
})

const formattedAuthResponse = computed(() => {
  if (props.authError) {
    return typeof props.authError === 'object'
      ? JSON.stringify(props.authError, Object.getOwnPropertyNames(props.authError), 2)
      : String(props.authError)
  }
  if (props.authResponse !== null && props.authResponse !== undefined) {
    return typeof props.authResponse === 'object'
      ? JSON.stringify(props.authResponse, null, 2)
      : String(props.authResponse)
  }
  return '// No response received from useSendProfile yet'
})

const formattedRequest = computed(() => {
  if (props.requestPayload !== null && props.requestPayload !== undefined) {
    return JSON.stringify(props.requestPayload, null, 2)
  }
  return '// No request payload specified'
})

const currentDisplayContent = computed(() => {
  if (activeTab.value === 'profile') return formattedResponse.value
  if (activeTab.value === 'apiPayload') return formattedAuthPayload.value
  if (activeTab.value === 'apiResponse') return formattedAuthResponse.value
  return formattedRequest.value
})

const currentTabLoading = computed(() => {
  if (activeTab.value === 'apiResponse' || activeTab.value === 'apiPayload') return props.isAuthLoading
  if (activeTab.value === 'profile') return props.isLoading
  return false
})

const currentTabError = computed(() => {
  if (activeTab.value === 'apiResponse') return !!props.authError
  if (activeTab.value === 'profile') return !!props.error
  return false
})

const currentTabSuccess = computed(() => {
  if (activeTab.value === 'apiResponse') return !!props.authResponse && !props.authError
  if (activeTab.value === 'apiPayload') return !!props.authPayload
  if (activeTab.value === 'profile') return !!props.response && !props.error
  return false
})

const copyApiUrl = async () => {
  if (!props.apiUrl) return
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.apiUrl)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = props.apiUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    urlCopied.value = true
    setTimeout(() => {
      urlCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy URL', err)
  }
}

const copyToClipboard = async () => {
  const content = currentDisplayContent.value
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(content)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}
</script>

<template>
  <ion-modal :is-open="isOpen" mode="ios" @didDismiss="emit('close')" class="bridge-response-modal">
    <ion-content class="modal-content-wrapper">
      <div class="modal-box">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <div class="badge-handler">callHandler</div>
            <h2 class="header-title">{{ handlerName }}</h2>
          </div>
          <button class="close-btn" @click="emit('close')" aria-label="Close">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>

        <!-- API URL Banner -->
        <div v-if="apiUrl" class="api-url-bar">
          <div class="api-url-left">
            <span class="http-badge">{{ apiMethod || 'POST' }}</span>
            <span class="url-text" :title="apiUrl">{{ apiUrl }}</span>
          </div>
          <button class="copy-url-btn" type="button" @click="copyApiUrl" :title="urlCopied ? 'Copied' : 'Copy API URL'">
            <ion-icon :icon="urlCopied ? checkmarkOutline : copyOutline" />
            <span class="copy-url-label">{{ urlCopied ? 'Copied' : 'Copy URL' }}</span>
          </button>
        </div>

        <!-- Status Bar -->
        <div
          class="status-bar"
          :class="{
            isError: currentTabError,
            isSuccess: currentTabSuccess
          }"
        >
          <div class="status-indicator">
            <ion-spinner v-if="currentTabLoading" name="crescent" class="loading-spinner"></ion-spinner>
            <ion-icon v-else-if="currentTabError" :icon="alertCircleOutline" class="status-icon error" />
            <ion-icon v-else-if="currentTabSuccess" :icon="checkmarkCircleOutline" class="status-icon success" />
            <span class="status-text">
              <template v-if="currentTabLoading">
                {{ (activeTab === 'apiResponse' || activeTab === 'apiPayload') ? 'Calling useSendProfile Auth API...' : 'Waiting for Native Mobile response...' }}
              </template>
              <template v-else-if="currentTabError">
                {{ activeTab === 'apiResponse' ? 'Auth API Error' : 'Bridge Error' }}
              </template>
              <template v-else-if="currentTabSuccess">
                {{ activeTab === 'apiResponse' ? 'Auth Token Success (200 OK)' : activeTab === 'apiPayload' ? 'Payload Ready' : 'Profile Received (200 OK)' }}
              </template>
              <template v-else>Ready to inspect</template>
            </span>
          </div>

          <button v-if="!isLoading && !isAuthLoading" class="action-btn" @click="emit('refresh')" title="Refresh call">
            <ion-icon :icon="refreshOutline" />
            <span>Re-fetch</span>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            ABA Profile
            <span v-if="response" class="tab-badge ok">✓</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'apiPayload' }"
            @click="activeTab = 'apiPayload'"
          >
            API Payload
            <span v-if="authPayload" class="tab-badge ok">✓</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'apiResponse' }"
            @click="activeTab = 'apiResponse'"
          >
            API Response
            <span v-if="authResponse && !authError" class="tab-badge ok">✓</span>
            <span v-else-if="authError" class="tab-badge err">!</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'bridgePayload' }"
            @click="activeTab = 'bridgePayload'"
          >
            Bridge Req
          </button>
          <button class="copy-btn" @click="copyToClipboard">
            <ion-icon :icon="copied ? checkmarkOutline : copyOutline" />
            <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
          </button>
        </div>

        <!-- Code Viewer Body -->
        <div class="code-container">
          <div class="code-header">
            <span class="code-lang">JSON</span>
            <span class="code-info">
              <template v-if="activeTab === 'profile'">ABA Mobile App Output (Native Bridge)</template>
              <template v-else-if="activeTab === 'apiPayload'">Payload Sent to Backend Auth API</template>
              <template v-else-if="activeTab === 'apiResponse'">useSendProfile Response (OAuth Token)</template>
              <template v-else>Input Sent to Native Bridge</template>
            </span>
          </div>
          <pre class="json-viewer"><code>{{ currentDisplayContent }}</code></pre>
        </div>

        <!-- Footer / Dismiss -->
        <div class="modal-footer">
          <button class="dismiss-btn" @click="emit('close')">
            Close Inspector
          </button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.bridge-response-modal {
  --width: 92%;
  --max-width: 500px;
  --height: 80%;
  --max-height: 640px;
  --border-radius: 20px;
}

.modal-content-wrapper {
  --background: #0f172a;
  background: #0f172a;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.modal-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px;
  box-sizing: border-box;
  min-height: 0;
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

/* API URL Banner */
.api-url-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.api-url-left {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
}

.http-badge {
  background: #2563eb;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.url-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  color: #93c5fd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.copy-url-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #bfdbfe;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 5px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.copy-url-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

.copy-url-label {
  display: inline;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-handler {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* Status Bar */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
}

.status-bar.isSuccess {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.1);
}

.status-bar.isError {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  --color: #60a5fa;
}

.status-icon.success {
  color: #22c55e;
  font-size: 18px;
}

.status-icon.error {
  color: #ef4444;
  font-size: 18px;
}

.status-text {
  color: #cbd5e1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 5px 10px;
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Tab Bar */
.tab-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  width: 100%;
  padding-bottom: 4px;
}

.tab-bar::-webkit-scrollbar {
  height: 4px;
}

.tab-bar::-webkit-scrollbar-track {
  background: transparent;
}

.tab-bar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.tab-bar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
}

.tab-badge {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  font-weight: 700;
  line-height: 1;
}

.tab-badge.err {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
}

.tab-btn.active {
  background: #1e293b;
  color: #38bdf8;
}

.copy-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 5px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 5px 12px;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #334155;
  color: #ffffff;
}

/* Code Container */
.code-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #020617;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  min-height: 0;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.code-lang {
  color: #38bdf8;
  font-weight: 700;
}

.code-info {
  color: #64748b;
}

.json-viewer {
  margin: 0;
  padding: 12px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12.5px;
  line-height: 1.5;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.json-viewer::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.json-viewer::-webkit-scrollbar-track {
  background: transparent;
}

.json-viewer::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.json-viewer::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Footer */
.modal-footer {
  margin-top: 14px;
}

.dismiss-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.dismiss-btn:hover {
  background: #1d4ed8;
}
</style>
