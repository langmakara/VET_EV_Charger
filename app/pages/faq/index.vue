<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { sendTitleToFlutter } from '~/composables/useNativeBridge';

onMounted(() => {
  sendTitleToFlutter('FAQ');
});

interface FaqItem {
  id: number;
  question: string;
  steps?: string[];
  answer?: string;
}

const faqs = ref<FaqItem[]>([
  {
    id: 1,
    question: 'How do I use the EV charging station?',
    steps: [
      '1. Locate a Charging Station',
      '2. Check Charging Compatibility',
      '3. Plug In Your EV',
      '4. Start the Charging Session'
    ]
  },
  {
    id: 2,
    question: 'How do I view my charging report?',
    steps: [
      '1. Open the VET EV Charger app',
      '2. Go to the "Charging History" tab or Profile',
      '3. Tap on any completed session to view energy consumed (kWh), duration, and total cost receipt'
    ]
  },
  {
    id: 3,
    question: 'How do I top up?',
    steps: [
      '1. Open the "Wallet" or "Membership" section',
      '2. Tap the "Top Up" button',
      '3. Enter your top-up amount and select payment method (ABA PAY or KHQR)',
      '4. Confirm payment to instantly credit your account'
    ]
  },
  {
    id: 4,
    question: 'How do I stop a charging session?',
    steps: [
      '1. Open the active charging screen in your app',
      '2. Tap "Stop Charging" and confirm',
      '3. Wait for the session to finish and the connector to unlock',
      '4. Unplug the cable and safely return it to the station holster'
    ]
  },
  {
    id: 5,
    question: 'What payment methods are supported?',
    steps: [
      '1. ABA PAY / ABA Mobile Mini App integration',
      '2. KHQR universal payment',
      '3. VET Member Points and Pre-funded Balance'
    ]
  },
  {
    id: 6,
    question: 'What should I do if a charger fails to start?',
    steps: [
      '1. Ensure the charging connector is firmly clicked into your car port',
      '2. Verify that your wallet has sufficient balance',
      '3. Check the charger screen for any fault or emergency stop notices',
      '4. Contact VET 24/7 customer support via the Contact section'
    ]
  }
]);

// Currently open FAQ index (default to the first item matching the design screenshot)
const openId = ref<number | null>(1);

const toggleFaq = (id: number) => {
  openId.value = openId.value === id ? null : id;
};
</script>

<template>
  <ion-page>
    <ion-content class="faq-page-content" :fullscreen="true">
      <div class="faq-container">
        <!-- FAQ Accordion List -->
        <div class="faq-list">
          <div
            v-for="item in faqs"
            :key="item.id"
            class="faq-item"
            :class="{ 'is-open': openId === item.id }"
          >
            <!-- Question Row -->
            <button
              type="button"
              class="faq-question-btn"
              @click="toggleFaq(item.id)"
              :aria-expanded="openId === item.id"
            >
              <span class="faq-question-text">{{ item.question }}</span>
              <span
                class="faq-chevron"
                :class="{ 'is-expanded': openId === item.id }"
              >
                <!-- Clean chevron icon identical to screenshot -->
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e293b"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
            </button>

            <!-- Answer Box (Expandable) -->
            <div
              v-show="openId === item.id"
              class="faq-answer-wrapper"
            >
              <div class="faq-answer-card">
                <template v-if="item.steps && item.steps.length">
                  <div
                    v-for="(step, sIdx) in item.steps"
                    :key="sIdx"
                    class="faq-step-line"
                  >
                    {{ step }}
                  </div>
                </template>
                <p v-else class="faq-answer-text">
                  {{ item.answer }}
                </p>
              </div>
            </div>

            <!-- Divider Line -->
            <div class="faq-divider"></div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.faq-page-content {
  --background: #ffffff;
  background-color: #ffffff;
}

.faq-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #ffffff;
  padding: 16px 20px 40px 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* FAQ List */
.faq-list {
  display: flex;
  flex-direction: column;
}

.faq-item {
  width: 100%;
}

/* Question Button */
.faq-question-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  outline: none;
  gap: 12px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.faq-question-text {
  font-size: 15.5px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.45;
  letter-spacing: -0.15px;
  flex: 1;
}

/* Chevron with smooth rotation */
.faq-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-chevron.is-expanded {
  transform: rotate(90deg);
}

/* Answer Box (Matches screenshot design) */
.faq-answer-wrapper {
  padding-bottom: 16px;
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.faq-answer-card {
  background-color: #f3f4f8;
  border-radius: 8px;
  padding: 16px 20px;
  box-sizing: border-box;
}

.faq-step-line {
  font-size: 14.5px;
  font-weight: 400;
  color: #2b3648;
  line-height: 1.8;
  letter-spacing: 0.1px;
}

.faq-answer-text {
  font-size: 14.5px;
  font-weight: 400;
  color: #2b3648;
  line-height: 1.65;
  margin: 0;
}

/* Divider */
.faq-divider {
  width: 100%;
  height: 1px;
  background-color: #eef2f6;
}
</style>
