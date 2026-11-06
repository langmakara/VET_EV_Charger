<template>
  <div class="aba-test-container">
    <header class="test-header">
      <h2>ABA Bridge Local Hash Testing Sandbox</h2>
    </header>

    <main class="test-content">
      <!-- Configuration Controls Section -->
      <section class="control-card">
        <h3>Mock Test Configurations</h3>
        <div class="form-group">
          <label>Sandbox Secret Key:</label>
          <input type="text" v-model="secretKey" placeholder="Enter test secretKey..." />
        </div>
      </section>

      <!-- API #1 Action Section (getProfile Verification) -->
      <section class="api-card">
        <div class="api-meta">
          <span class="badge get">GET</span>
          <strong>API #1: getProfile Validation Loop</strong>
        </div>
        <p class="description">Queries profile parameters over the bridge container, hashes fields locally, and validates the native token payload signature alignment.</p>
        <button @click="testProfileValidation" class="btn btn-primary">
          Execute Profile Verification Sweep
        </button>
      </section>

      <!-- API #3 Action Section (doPayment Pre-Generation Injection) -->
      <section class="api-card">
        <div class="api-meta">
          <span class="badge post">POST</span>
          <strong>API #3: doPayment Execution Injection</strong>
        </div>
        <p class="description">Pre-computes required parameter checks locally on the client runtime frame, wraps payload properties cleanly, and triggers the native checkout view context window overlay.</p>
        
        <div class="payment-inputs">
          <input type="number" v-model.number="paymentAmount" step="0.01" placeholder="Amount (e.g. 15.75)" />
          <select v-model="paymentCurrency">
            <option value="USD">USD</option>
            <option value="KHR">KHR</option>
          </select>
        </div>
        
        <button @click="testPaymentTrigger" class="btn btn-success">
          Generate Hash & Invoke doPayment
        </button>
      </section>

      <!-- Visual Terminal Output Stream Panels -->
      <section class="console-log-wrapper">
        <h3>Runtime Logging Window Output Diagnostics</h3>
        <div class="console-box">
          <div v-for="(log, idx) in runtimeLogs" :key="idx" :class="['log-line', log.type]">
            <span class="timestamp">[{{ log.time }}]</span> {{ log.message }}
          </div>
          <div v-if="runtimeLogs.length === 0" class="log-placeholder">
            No system execution traces recorded yet. Fire an validation event stream execution loop above...
          </div>
        </div>
        <button v-if="runtimeLogs.length > 0" @click="runtimeLogs = []" class="btn-clear">
          Reset Console Logs
        </button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { callHandler } from 'web-bridge-gateway';

// --- Reactive State Context Metrics ---
const secretKey = ref('TEST_SECRET_KEY_ABA_TEAMS');
const paymentAmount = ref(12000.00);
const paymentCurrency = ref<'USD' | 'KHR'>('KHR');
const runtimeLogs = ref<Array<{ time: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }>>([]);

// --- Internal Helper: System Diagnostics Logger ---
const pushLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
  const time = new Date().toLocaleTimeString();
  runtimeLogs.value.unshift({ time, message, type });
};

// --- Cryptographic Utility: Web Crypto SHA-256 Engine ---
const generateSha256Hex = async (plainText: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

// --- Transaction Utility: Decimal Formatter --
const formatToTwoDecimals = (value: number): string => {
  return value.toFixed(2);
};

// ==========================================
// TEST IMPLEMENTATION #1: getProfile Validation Verification Sweep
// ==========================================
const testProfileValidation = async () => {
  pushLog('Initiating secure container getProfile context call...', 'info');
  
  try {
    // 1. Fire native transaction to grab profile details data properties from bridge shell container
    const profileResponse = await callHandler('getProfile', {}) as any;
    
    if (!profileResponse) {
      pushLog('Empty response block parsed across web boundary window layer', 'error');
      return;
    }

    pushLog(`Payload resolved from Native layer. AppId target trace: ${profileResponse.appId}`, 'info');

    // Extract values cleanly checking against fallback boundaries to avoid string leaks
    const appId = profileResponse.appId || '';
    const firstName = profileResponse.firstName || '';
    const lastName = profileResponse.lastName || '';
    const fullName = profileResponse.fullName || '';
    const sex = profileResponse.sex || '';
    const dobShort = profileResponse.dobShort || '';
    const nationality = profileResponse.nationality || '';
    const nativeProvidedHash = profileResponse.hash;

    // 2. Map structural concatenation properties matching image_wwFX-7.png exactly
    const rawConcat = `${appId}${firstName}${lastName}${fullName}${sex}${dobShort}${nationality}${secretKey.value}`;
    const plainText = rawConcat.toUpperCase();
    pushLog(`Computed Plaintext Target: "${plainText}"`, 'info');

    // 3. Compute structural checksum key signature locally
    const computedLocalHash = await generateSha256Hex(plainText);
    
    pushLog(`Received Native Signature Token: ${nativeProvidedHash || 'MISSING_IN_PAYLOAD'}`, 'info');
    pushLog(`Calculated Local Signature Token: ${computedLocalHash}`, 'info');

    // 4. Assert authentication token bounds match perfectly
    if (nativeProvidedHash === computedLocalHash) {
      pushLog('✅ Identity Verification Alignment Success! Signatures match perfectly.', 'success');
    } else {
      pushLog('❌ Verification Anomaly Detected! Signatures mismatched. Verify profile parameters or testing key values.', 'warn');
    }

  } catch (err: any) {
    pushLog(`Exception runtime hook breakdown caught over bridge interface: ${err.message || err}`, 'error');
  }
};

// ==========================================
// TEST IMPLEMENTATION #2: doPayment Local Hash Injection Flow
// ==========================================
const testPaymentTrigger = async () => {
  const transactionId = "TEST-ORDER-" + Date.now();
  const stringifiedAmount = formatToTwoDecimals(paymentAmount.value);
  
  pushLog(`Starting manual payment hash calculation loop block targeting: ${transactionId}`, 'info');

  try {
    // 1. Compute plainText logic signature matrix before deployment checking matching image_XNVPAP.png rules
    // plaintext = uppercase(account + amount + currency + secretKey)
    const rawPaymentConcat = `${transactionId}${stringifiedAmount}${paymentCurrency.value}${secretKey.value}`;
    const paymentPlainText = rawPaymentConcat.toUpperCase();
    pushLog(`Payment Target Concat: "${paymentPlainText}"`, 'info');

    // 2. Generate uppercase hex output signature
    const computedPaymentHash = await generateSha256Hex(paymentPlainText);
    pushLog(`Generated Mock Payment Verification Hash: ${computedPaymentHash}`, 'info');

    // 3. Construct payload template blocks
    const paymentPayload = {
      amount: stringifiedAmount,
      account: transactionId,
      currency: paymentCurrency.value,
      vendorId: "MOCK_LOCAL_VENDOR_ID",
      useDefault: false,
      additionalKey: {
        hash: computedPaymentHash
      }
    };

    pushLog('Invoking fire-and-forget command handler "doPayment" over native bridge...', 'info');
    
    // 4. Execute asynchronous handler command stack against active frame device context view layout
    await callHandler('doPayment', paymentPayload);
    
    pushLog('doPayment executed. Screen workflow overlay processing has passed control to the host native app component layer.', 'success');

  } catch (err: any) {
    pushLog(`Failed execution step processing doPayment invocation loops: ${err.message || err}`, 'error');
  }
};
</script>

<style scoped>
.aba-test-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  background-color: #f7fafc;
  color: #2d3748;
}
.test-header {
  text-align: center;
  margin-bottom: 24px;
  color: #005b82;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
}
.control-card, .api-card, .console-log-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}
h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 6px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
input[type="text"], input[type="number"], select {
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 14px;
}
.api-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.badge {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}
.badge.get { background-color: #3182ce; }
.badge.post { background-color: #38a169; }
.description {
  font-size: 13px;
  color: #718096;
  margin-bottom: 14px;
  line-height: 1.4;
}
.payment-inputs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.payment-inputs input { flex: 2; }
.payment-inputs select { flex: 1; }
.btn {
  width: 100%;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}
.btn:active { opacity: 0.85; }
.btn-primary { background-color: #005b82; }
.btn-success { background-color: #2b6cb0; }
.console-box {
background-color: #1a202c;
color: #a0aec0;
font-family: monospace;
font-size: 12px;
padding: 12px;
border-radius: 6px;
height: 250px;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 6px;
}
.log-placeholder {
color: #4a5568;
text-align: center;
margin-top: 100px;
font-style: italic;
}
.log-line {
line-height: 1.4;
word-break: break-all;
}
.log-line.info { color: #e2e8f0; }
.log-line.success { color: #48bb78; font-weight: bold; }
.log-line.warn { color: #ecc94b; }
.log-line.error { color: #f56565; }
.timestamp { color: #718096; margin-right: 4px; }
.btn-clear {
background: transparent;
border: 1px solid #cbd5e0;
padding: 6px 12px;
font-size: 12px;
border-radius: 4px;
margin-top: 8px;
cursor: pointer;
color: #4a5568;
}
.btn-clear:hover { background: #edf2f7; }

</style>