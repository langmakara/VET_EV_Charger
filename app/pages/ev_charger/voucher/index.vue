<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    onIonViewDidEnter
  } from '@ionic/vue'
  import AppInputField from '~/components/Controls/AppInputField.vue'
  import IconButton from '~/components/Button/IconButton.vue'
  import VoucherCard from '~/components/Card/VoucherCard.vue'
  import AlertComponent from '~/components/Modal/AlertComponent.vue'
  import ToastAlert from '~/components/Alert/ToastAlert.vue'
  import { useApplyVoucherMutation, useSearchVoucherQuery, useVoucherInfinite } from '~/composables/queries/useVoucher'
  import type { VoucherDate } from '~/api/types'

  const route = useRoute()
  const voucherInputCode = ref('')
  const scannedVoucherCode = useState<string>('scannedVoucherCode', () => '')

  const applyScannedCode = (code?: string) => {
    if (code) {
      voucherInputCode.value = String(code)
    }
  }

  // Watch for code passed from camera scanner (via state or ?code=...)
  watch(
    [() => route.query.code, scannedVoucherCode],
    ([queryCode, stateCode]) => {
      const code = stateCode || queryCode
      if (code) {
        applyScannedCode(code as string)
        if (stateCode) {
          scannedVoucherCode.value = ''
        }
      }
    },
    { immediate: true }
  )

  onIonViewDidEnter(() => {
    if (scannedVoucherCode.value) {
      applyScannedCode(scannedVoucherCode.value)
      scannedVoucherCode.value = ''
    }
  })

  // Fetch vouchers with infinite query
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useVoucherInfinite()

  // Search voucher by code (partial match from POST /voucher/search)
  const {
    data: voucherData,
    isLoading: voucherIsLoading,
    isError: voucherIsError,
    error: voucherError
  } = useSearchVoucherQuery(voucherInputCode)

  const { mutateAsync: applyVoucher, isPending: isApplyVoucherLoading } = useApplyVoucherMutation()

  // Flatten all paginated pages into VoucherDate[]
  const rawVouchers = computed<VoucherDate[]>(() => {
    return (
      data.value?.pages.flatMap((page) => {
        const res = (page as any)?.data ?? page?.body?.data
        return Array.isArray(res) ? res : (res?.list ?? [])
      }) ?? []
    )
  })

  // Flatten search results
  const searchedVouchers = computed<VoucherDate[]>(() => {
    const res = (voucherData.value as any)?.data ?? voucherData.value?.body?.data
    return Array.isArray(res) ? res : (res?.list ?? [])
  })

  // Display searched vouchers when code is entered, otherwise show paginated list
  const displayedVouchers = computed<VoucherDate[]>(() => {
    if (voucherInputCode.value?.trim()) {
      return searchedVouchers.value
    }
    return rawVouchers.value
  })

  const currentLoading = computed(() => {
    return voucherInputCode.value?.trim() ? voucherIsLoading.value : isLoading.value
  })

  const isCurrentError = computed(() => {
    return voucherInputCode.value?.trim() ? voucherIsError.value : isError.value
  })

  const currentErrorMessage = computed(() => {
    if (voucherInputCode.value?.trim()) {
      return voucherError.value?.message || 'Failed to search voucher'
    }
    return error.value?.message || 'Failed to load vouchers'
  })

  // Infinite scroll handler
  const loadMore = async (event: CustomEvent) => {
    if (hasNextPage?.value && !voucherInputCode.value?.trim()) {
      await fetchNextPage()
    }
    ;(event.target as HTMLIonInfiniteScrollElement).complete()
  }

  const isAlertOpen = ref(false)
  const isToastOpen = ref(false)
  const toastType = ref<'success' | 'error'>('success')
  const toastTitle = ref('Success')
  const toastMessage = ref('Voucher added successfully')
  const toastHighlightText = ref('')
  const selectedVoucher = ref<VoucherDate | null>(null)

  const handleCardClick = (voucher: VoucherDate) => {
    const code = voucher.voucherCode
    console.log('code', code)
    selectedVoucher.value = voucher
    isAlertOpen.value = true
  }

  const handleAlertCancel = () => {
    isAlertOpen.value = false
  }

  const handleAlertConfirm = async () => {
    const code = selectedVoucher.value?.voucherCode
    if (!code) return

    try {
      const res = await applyVoucher({ code })
      isAlertOpen.value = false

      // Check status from response (header.result, body.status)
      const isSuccess = Boolean(
        (res?.body?.status ?? res?.header?.result ?? (res as any)?.status) === true
      )
      const responseMessage =
        res?.body?.message ??
        (res as any)?.message ??
        (isSuccess ? 'Voucher applied successfully' : 'Failed to apply voucher')

      toastType.value = isSuccess ? 'success' : 'error'
      toastTitle.value = isSuccess ? 'Success' : 'Failed'
      toastMessage.value = responseMessage
      toastHighlightText.value = isSuccess
        ? (selectedVoucher.value?.batchTitle || selectedVoucher.value?.voucherCode || '')
        : ''
      isToastOpen.value = true
    } catch (err: any) {
      console.error('Failed to apply voucher:', err)
      isAlertOpen.value = false
      toastType.value = 'error'
      toastTitle.value = 'Failed'
      const errRes = err?.response?.data
      toastMessage.value =
        errRes?.body?.message ||
        errRes?.message ||
        err?.message ||
        'Failed to apply voucher'
      toastHighlightText.value = ''
      isToastOpen.value = true
    }
  }

  const handlescanVouchercode = () => {
    navigateTo('/ev_charger/voucher/camera')
  }
</script>

<template>
  <ion-page>
    <ion-content>
      <ion-grid columns="2" class="voucher-grid">
        <ion-row>
          <ion-col>
            <AppInputField
              v-model="voucherInputCode"
              label="Enter or scan voucher code"
              placeholder="Code"
            />
          </ion-col>
          <ion-col size="auto" class="btn-container">
            <IconButton buttonType="scan" size="lg" @click="handlescanVouchercode" />
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Loading indicator -->
      <div v-if="currentLoading" class="ion-text-center ion-padding" style="margin-top: 40px">
        <ion-spinner name="crescent" />
      </div>

      <!-- Error state -->
      <div v-else-if="isCurrentError" class="ion-text-center ion-padding">
        <ion-text color="danger">{{ currentErrorMessage }}</ion-text>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="displayedVouchers.length === 0"
        class="ion-text-center ion-padding"
        style="margin-top: 40px"
      >
        <ion-text color="medium">
          {{ voucherInputCode?.trim() ? 'No vouchers match your code' : 'No vouchers available' }}
        </ion-text>
      </div>

      <!-- Voucher List -->
      <div v-else class="vouchers-container">
        <VoucherCard
          v-for="item in displayedVouchers"
          :key="item.id || item.voucherCode"
          :voucher="item"
          @click="handleCardClick(item)"
        />

        <!-- Infinite Scroll (disabled while actively searching) -->
        <ion-infinite-scroll
          :disabled="!hasNextPage || !!voucherInputCode?.trim()"
          @ionInfinite="loadMore"
        >
          <ion-infinite-scroll-content
            loading-spinner="crescent"
            loading-text="Loading more vouchers..."
          />
        </ion-infinite-scroll>
      </div>

      <!-- Alert Component for Voucher Confirmation -->
      <AlertComponent
        :isOpen="isAlertOpen"
        type="voucher"
        :isLoading="isApplyVoucherLoading"
        @cancel="handleAlertCancel"
        @confirm="handleAlertConfirm"
        @didDismiss="isAlertOpen = false"
      />

      <!-- Success / Error Notification Toast Component -->
      <ToastAlert
        v-model:isOpen="isToastOpen"
        :type="toastType"
        :title="toastTitle"
        :message="toastMessage"
        :highlightText="toastHighlightText"
      />
    </ion-content>
  </ion-page>
</template>

<style scoped>
  .btn-container {
    display: flex;
    align-items: flex-end;
    padding-bottom: 5px;
    padding-right: 5px;
  }

  .vouchers-container {
    display: flex;
    flex-direction: column;
  }
  .voucher-grid {
    padding: 10px 0;
  }
</style>
