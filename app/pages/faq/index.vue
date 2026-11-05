<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { sendTitleToFlutter } from '~/composables/useNativeBridge';
import { useFaqsInfinite } from '~/composables/queries';
import type { FaqsDropdownData, DropdownParams } from '~/api/types';

const { locale } = useI18n();

onMounted(() => {
  sendTitleToFlutter('FAQ');
});

const filter = ref<DropdownParams>({
  rowsPerPage: 25
});

const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useFaqsInfinite(filter);

// Flatten all paginated pages into FaqsDropdownData[]
const faqs = computed<FaqsDropdownData[]>(() => {
  return (
    data.value?.pages.flatMap((page) => {
      const res = (page as any)?.data ?? page?.body?.data;
      return Array.isArray(res) ? res : res?.list ?? [];
    }) ?? []
  );
});

// Currently open FAQ index (default to the first item once loaded)
const openId = ref<number | string | null>(null);

watch(
  faqs,
  (list) => {
    if (openId.value === null && list.length > 0 && list[0]?.id != null) {
      openId.value = list[0].id;
    }
  },
  { immediate: true }
);

const toggleFaq = (id: number | string) => {
  openId.value = openId.value === id ? null : id;
};

const getQuestion = (item: FaqsDropdownData): string => {
  const loc = locale.value;
  if (loc === 'km') return item.questionKh || item.questionEn || '';
  if (loc === 'zh') return item.questionCh || item.questionZh || item.questionEn || '';
  return item.questionEn || item.questionKh || item.questionCh || '';
};

const getAnswer = (item: FaqsDropdownData): string => {
  const loc = locale.value;
  if (loc === 'km') return item.answerKh || item.answerEn || '';
  if (loc === 'zh') return item.answerCh || item.answerZh || item.answerEn || '';
  return item.answerEn || item.answerKh || item.answerCh || '';
};

const getAnswerSteps = (item: FaqsDropdownData): string[] => {
  const answer = getAnswer(item);
  if (!answer) return [];
  if (answer.includes('\n')) {
    return answer
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const loadMore = async (event: CustomEvent) => {
  if (hasNextPage?.value) {
    await fetchNextPage();
  }
  (event.target as HTMLIonInfiniteScrollElement).complete();
};
</script>

<template>
  <ion-page>
    <ion-content class="faq-page-content" :fullscreen="true">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-spinner name="crescent" />
      </div>

      <!-- Error state -->
      <div v-else-if="isError" class="ion-text-center ion-padding">
        <ion-text color="danger">{{ error?.message || 'Failed to load FAQs' }}</ion-text>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="faqs.length === 0"
        class="ion-text-center ion-padding"
        style="margin-top: 40px"
      >
        <ion-text color="medium">No FAQs available</ion-text>
      </div>

      <!-- FAQ Container -->
      <div v-else class="faq-container">
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
              @click="item.id != null && toggleFaq(item.id)"
              :aria-expanded="openId === item.id"
            >
              <span class="faq-question-text">{{ getQuestion(item) }}</span>
              <span
                class="faq-chevron"
                :class="{ 'is-expanded': openId === item.id }"
              >
                <!-- Clean chevron icon -->
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
                <template v-if="getAnswerSteps(item).length > 1">
                  <div
                    v-for="(step, sIdx) in getAnswerSteps(item)"
                    :key="sIdx"
                    class="faq-step-line"
                  >
                    {{ step }}
                  </div>
                </template>
                <p v-else class="faq-answer-text">
                  {{ getAnswer(item) }}
                </p>
              </div>
            </div>

            <!-- Divider Line -->
            <div class="faq-divider"></div>
          </div>
        </div>

        <!-- Infinite Scroll -->
        <ion-infinite-scroll
          :disabled="!hasNextPage"
          @ionInfinite="loadMore"
        >
          <ion-infinite-scroll-content
            loading-spinner="crescent"
            loading-text="Loading more FAQs..."
          />
        </ion-infinite-scroll>
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
