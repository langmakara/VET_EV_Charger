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
    response?: any
    error?: any
    isLoading?: boolean
  }>(),
  {
    isOpen: false,
    handlerName: 'getProfile',
    requestPayload: null,
    response: null,
    error: null,
    isLoading: false
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

const activeTab = ref<'response' | 'request'>('response')
const copied = ref(false)

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
  return '// No response received yet'
})

const formattedRequest = computed(() => {
  if (props.requestPayload !== null && props.requestPayload !== undefined) {
    return JSON.stringify(props.requestPayload, null, 2)
  }
  return '// No request payload specified'
})

const copyToClipboard = async () => {
  const content =
    activeTab.value === 'response' ? formattedResponse.value : formattedRequest.value
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

        <!-- Status Bar -->
        <div class="status-bar" :class="{ isError: !!error, isSuccess: !!response && !error }">
          <div class="status-indicator">
            <ion-spinner v-if="isLoading" name="crescent" class="loading-spinner"></ion-spinner>
            <ion-icon v-else-if="error" :icon="alertCircleOutline" class="status-icon error" />
            <ion-icon v-else :icon="checkmarkCircleOutline" class="status-icon success" />
            <span class="status-text">
              <template v-if="isLoading">Waiting for Native Mobile response...</template>
              <template v-else-if="error">Bridge Error</template>
              <template v-else-if="response">Response Received (200 OK)</template>
              <template v-else>Ready to inspect</template>
            </span>
          </div>

          <button v-if="!isLoading" class="action-btn" @click="emit('refresh')" title="Refresh call">
            <ion-icon :icon="refreshOutline" />
            <span>Re-fetch</span>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'response' }"
            @click="activeTab = 'response'"
          >
            Response JSON
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'request' }"
            @click="activeTab = 'request'"
          >
            Request Payload
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
            <span class="code-info">{{ activeTab === 'response' ? 'Native Output' : 'Input Sent' }}</span>
          </div>
          <pre class="json-viewer"><code>{{ activeTab === 'response' ? formattedResponse : formattedRequest }}</code></pre>
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
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
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
  margin-bottom: 8px;
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
  min-height: 220px;
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12.5px;
  line-height: 1.5;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
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
