import { ref, computed, watch, onMounted, type Ref, type ComputedRef } from 'vue'
import { useRoute, navigateTo } from '#app'
import { sendTitleToFlutter, abaBridge } from '~/composables/useNativeBridge'
import { useVoucherInfinite } from '~/composables/queries/useVoucher'
import { useCalculatePromotionMutation } from '~/composables/queries/usePromotion'
import { useCreateSaleOrderAppTmpMutation } from '~/composables/queries/useSaleOrder'
import { useWebSocket } from '~/composables/useChargintSocket'
import type {
  VoucherDate,
  CreateSaleOrderAppTmpParams,
  SaleOrderAppTmpData,
  PromotionCalculateParams,
  PromotionCalculateData
} from '~/api/types'
import type { AccountItem } from '~/pages/chargingInfor/accountModal.vue'

export { type AccountItem }

// Constants
export const KHR_PER_KWH = 2400 // Standard Cambodia EV charging rate (2,400 KHR / kWh)

export const KWH_PRESETS = ['20 kWh', '40 kWh', '60 kWh', '80 kWh', '100 kWh', 'Full Charge']
export const KHR_PRESETS = [
  '20,000 KHR',
  '40,000 KHR',
  '60,000 KHR',
  '80,000 KHR',
  '100,000 KHR',
  'Full Charge'
]

// Utilities
export const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('en-US')
}

// Helper to normalize account payload from ABA native bridge
export function normalizeAbaAccount(item: any, index = 0): AccountItem {
  const number =
    item.accountNumber ??
    item.account ??
    item.acc ??
    item.number ??
    item.accNo ??
    item.id ??
    ''

  const name =
    item.accountName ??
    item.accName ??
    item.name ??
    item.title ??
    (index === 0 ? 'Main' : `Account ${index + 1}`)

  const currency = item.currency ?? 'KHR'
  const id = String(item.id ?? number ?? `acc-${index + 1}`)
  const isDefault = item.useDefault ?? item.isDefault ?? index === 0
  const color = item.color ?? (currency === 'USD' ? '#00C0DE' : '#9353D3')

  return { id, name, number, currency, isDefault, color }
}

export function useChargingInforService() {
  const route = useRoute()
  const calculatePromotionMutation = useCalculatePromotionMutation()
  const createTempOrder = useCreateSaleOrderAppTmpMutation()

  // Helper to retrieve chargerUsername & plugId from query or session cache
  const getChargerUsername = (): string => {
    const raw =
      route.query.chargerUsername ||
      route.query.chargerUserName ||
      route.query.chargerCode ||
      route.query.code
    if (raw) {
      const str = String(raw).trim()
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('vet_ev_charger_username', str)
      }
      return str
    }
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('vet_ev_charger_username') || ''
    }
    return ''
  }

  const getPlugId = (): number => {
    const raw =
      route.query.plugId ||
      route.query.plug_id ||
      route.query.gunId ||
      route.query.gun_id
    if (raw !== undefined && raw !== null && raw !== '') {
      const num = Number(raw)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('vet_ev_plug_id', String(num))
      }
      return num
    }
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('vet_ev_plug_id')
      if (stored) return Number(stored)
    }
    return 0
  }

  // 1. Mode & Presets
  const selectedMode = ref<'kwh' | 'khr'>('kwh')
  const selectedPreset = ref('20 kWh')
  const inputAmount = ref<string>('20')

  const setMode = (mode: 'kwh' | 'khr') => {
    selectedMode.value = mode
    if (mode === 'kwh') {
      selectedPreset.value = '20 kWh'
      inputAmount.value = '20'
    } else {
      selectedPreset.value = '48,000 KHR'
      inputAmount.value = '48000'
    }
  }

  const selectPreset = (preset: string) => {
    selectedPreset.value = preset
    if (selectedMode.value === 'kwh') {
      if (preset === 'Full Charge') {
        inputAmount.value = '100'
      } else {
        inputAmount.value = preset.replace(' kWh', '')
      }
    } else {
      if (preset === 'Full Charge') {
        inputAmount.value = '240000'
      } else {
        inputAmount.value = preset.replace(/[^0-9]/g, '')
      }
    }
  }

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const rawValue = target.value.replace(/[^0-9]/g, '')
    inputAmount.value = rawValue

    if (selectedMode.value === 'kwh') {
      const match = KWH_PRESETS.find((p) => p === `${rawValue} kWh`)
      selectedPreset.value = match || ''
    } else {
      const formatted = formatNumber(Number(rawValue))
      const match = KHR_PRESETS.find((p) => p === `${formatted} KHR`)
      selectedPreset.value = match || ''
    }
  }

  // 2. Toast State
  const showToast = ref(false)
  const toastMessage = ref('')

  const triggerToast = (msg: string) => {
    toastMessage.value = msg
    showToast.value = true
  }

  // 3. Voucher State & Queries
  const { data: voucher } = useVoucherInfinite()

  const voucherList = computed<VoucherDate[]>(() => {
    return (
      voucher.value?.pages.flatMap((page: any) => {
        const res = page?.data ?? page?.body?.data
        return Array.isArray(res) ? res : (res?.list ?? [])
      }) ?? []
    )
  })

  const selectedVoucher = ref<VoucherDate | null>(null)
  const voucherDiscountPercent = ref<number>(0)
  const isVoucherSheetOpen = ref(false)

  const applyVoucher = (v: VoucherDate | null | undefined, showNotification = true) => {
    selectedVoucher.value = v ?? null
    if (v) {
      const discountVal = Number(v.discountValue ?? 0)
      voucherDiscountPercent.value = v.discountType === 1 || v.discountType == null ? discountVal : 0
      if (showNotification) {
        const discountLabel =
          v.discountType === 2
            ? `${formatNumber(discountVal)} KHR OFF`
            : `${discountVal}% OFF`
        triggerToast(`Applied ${discountLabel} voucher!`)
      }
    } else {
      voucherDiscountPercent.value = 0
    }
  }

  // Auto select (apply) first voucher response from API
  watch(
    () => voucherList.value,
    (newList) => {
      if (newList && newList.length > 0) {
        const currentStillExists = selectedVoucher.value
          ? newList.some(
              (v) =>
                (v.id != null && String(v.id) === String(selectedVoucher.value?.id)) ||
                (v.voucherCode && v.voucherCode === selectedVoucher.value?.voucherCode)
            )
          : false

        if (!selectedVoucher.value || !currentStillExists) {
          applyVoucher(newList[0] ?? null, false)
        }
      }
    },
    { immediate: true }
  )

  const handleApplyVoucher = (payload: { voucher: VoucherDate | null; percent: number; code: string }) => {
    if (payload.voucher) {
      applyVoucher(payload.voucher, true)
    } else if (payload.percent > 0) {
      selectedVoucher.value = null
      voucherDiscountPercent.value = payload.percent
      triggerToast(`Applied ${payload.percent}% OFF voucher!`)
    } else {
      applyVoucher(null, false)
      triggerToast('Voucher removed')
    }
  }

  // 4. Points State
  const pointsApplied = ref<number>(0)
  const isPointSheetOpen = ref(false)

  const handleApplyPoints = (payload: { points: number; kwh: number }) => {
    pointsApplied.value = payload.points
    triggerToast(
      payload.points > 0 ? `Applied ${formatNumber(payload.points)} Points!` : 'Points removed'
    )
  }

  // 5. Account State & Native Bridge
  const accounts = ref<AccountItem[]>([])
  const selectedAccountId = ref<string>('')
  const isLoadingAccount = ref(false)
  const isAccountModalOpen = ref(false)

  const currentAccount = computed<AccountItem | null>(() => {
    if (accounts.value.length === 0) return null
    return (
      accounts.value.find((acc) => acc.id === selectedAccountId.value) ||
      accounts.value.find((acc) => acc.isDefault) ||
      accounts.value[0] ||
      null
    )
  })

  // 6. Promotion API & Financial Calculations
  const calculatedDiscountAmount = ref<number | null>(null)
  const calculatedDiscountPercent = ref<number | null>(null)
  const isCalculatingPromotion = ref(false)

  const subTotal = computed(() => {
    const val = Number(inputAmount.value) || 0
    if (selectedMode.value === 'kwh') {
      return val * KHR_PER_KWH
    }
    return val
  })

  const voucherDiscountAmount = computed(() => {
    if (!selectedVoucher.value) {
      if (voucherDiscountPercent.value > 0) {
        return subTotal.value * (voucherDiscountPercent.value / 100)
      }
      return 0
    }
    const discountVal = Number(selectedVoucher.value.discountValue ?? 0)
    // Fixed amount discount (discountType === 2)
    if (selectedVoucher.value.discountType === 2) {
      return discountVal
    }
    // Percentage discount
    const percent = discountVal || voucherDiscountPercent.value || 0
    return subTotal.value * (percent / 100)
  })

  const discountAmount = computed(() => {
    if (calculatedDiscountAmount.value !== null && calculatedDiscountAmount.value > 0) {
      return calculatedDiscountAmount.value
    }
    return voucherDiscountAmount.value + pointsApplied.value
  })

  const totalPrice = computed(() => {
    return Math.max(0, subTotal.value - discountAmount.value)
  })

  const totalKwh = computed(() => {
    if (selectedMode.value === 'kwh') {
      return Number(inputAmount.value) || 0
    }
    return KHR_PER_KWH > 0 ? (Number(inputAmount.value) || 0) / KHR_PER_KWH : 0
  })

  const voucherBadgeText = computed(() => {
    if (!selectedVoucher.value) {
      return voucherDiscountPercent.value > 0 ? `${voucherDiscountPercent.value}% OFF` : 'None'
    }
    const val = Number(selectedVoucher.value.discountValue ?? voucherDiscountPercent.value)
    if (selectedVoucher.value.discountType === 2) {
      return `${formatNumber(val)} KHR OFF`
    }
    return val > 0 ? `${val}% OFF` : 'None'
  })

  const voucherLabelText = computed(() => {
    if (!selectedVoucher.value) {
      return voucherDiscountPercent.value > 0 ? `(${voucherDiscountPercent.value}%)` : ''
    }
    if (selectedVoucher.value.discountType === 2) {
      return `(${formatNumber(Number(selectedVoucher.value.discountValue ?? 0))} KHR)`
    }
    const pct = Number(selectedVoucher.value.discountValue ?? voucherDiscountPercent.value)
    return pct > 0 ? `(${pct}%)` : ''
  })

  // Calculate promotion discount via POST /promotion/calculate
  const calculatePromotion = async () => {
    const chargerUserName = getChargerUsername()
    const plugId = getPlugId()
    const amountKh = subTotal.value

    if (!chargerUserName || amountKh <= 0) {
      calculatedDiscountAmount.value = null
      calculatedDiscountPercent.value = null
      return
    }

    isCalculatingPromotion.value = true
    try {
      const res = await calculatePromotionMutation.mutateAsync({
        chargerUserName,
        voucherId: Number(selectedVoucher.value?.id ?? 0),
        redeemId: Number(pointsApplied.value ?? 0),
        amountKh,
        plugId
      })

      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      const data: PromotionCalculateData | undefined =
        (res as any)?.data ?? res?.body?.data ?? (res as any)?.body

      if (isSuccess !== false && data) {
        if (
          data.discountAmountKhr !== undefined &&
          data.discountAmountKhr !== null &&
          Number(data.discountAmountKhr) > 0
        ) {
          calculatedDiscountAmount.value = Number(data.discountAmountKhr)
        } else {
          calculatedDiscountAmount.value = null
        }
        if (
          data.discountPercentage !== undefined &&
          data.discountPercentage !== null &&
          Number(data.discountPercentage) > 0
        ) {
          calculatedDiscountPercent.value = Number(data.discountPercentage)
          voucherDiscountPercent.value = Number(data.discountPercentage)
        } else {
          calculatedDiscountPercent.value = null
        }
      } else {
        calculatedDiscountAmount.value = null
        calculatedDiscountPercent.value = null
      }
    } catch (err) {
      console.warn('Promotion calculate error (fallback to local calculation):', err)
      calculatedDiscountAmount.value = null
      calculatedDiscountPercent.value = null
    } finally {
      isCalculatingPromotion.value = false
    }
  }

  // Recalculate promotion discount when subTotal, voucher or points change
  let calcTimer: any = null
  watch(
    [() => subTotal.value, () => selectedVoucher.value, () => pointsApplied.value],
    () => {
      clearTimeout(calcTimer)
      calcTimer = setTimeout(() => {
        calculatePromotion()
      }, 300)
    },
    { immediate: true }
  )

  // Load default account from ABA bridge
  const loadDefaultAccount = async () => {
    isLoadingAccount.value = true
    try {
      const payload = {
        currency: 'KHR',
        amount: String(totalPrice.value || 0)
      }
      const res: any = await abaBridge.getDefaultAcc(payload)

      // Response might be { data: [...] } or a direct object / array
      const raw = res?.data ?? res?.result ?? res?.body ?? res
      if (Array.isArray(raw) && raw.length > 0) {
        accounts.value = raw.map((item: any, idx: number) => normalizeAbaAccount(item, idx))
      } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const hasAccountField =
          raw.account || raw.acc || raw.number || raw.accountNumber ||
          raw.name || raw.accountName || raw.accName || raw.id
        if (hasAccountField) {
          accounts.value = [normalizeAbaAccount(raw, 0)]
        }
      }

      if (accounts.value.length > 0) {
        const def = accounts.value.find((a) => a.isDefault) || accounts.value[0]
        if (def) {
          selectedAccountId.value = def.id
        }
      }
    } catch (err) {
      console.warn('Failed to get default account from ABA bridge:', err)
    } finally {
      isLoadingAccount.value = false
    }
  }

  const selectAccount = (account: AccountItem) => {
    selectedAccountId.value = account.id
    setTimeout(() => {
      isAccountModalOpen.value = false
    }, 180)
  }

  // 8. WebSocket for OCPI commands
  const { data: socketData, status: socketStatus, send: sendSocketMessage } = useWebSocket(
    'wss://qacltom.udaya-tech.com/OCPI/ws'
  )

  watch(socketData, (msg) => {
    console.log('[chargingInfor] Received WebSocket message:', msg)
  })

  function sendHello(customTxId?: string) {
    const chargerUsername = getChargerUsername()
    const plug = getPlugId() || 1
    const isFullCharge = selectedPreset.value === 'Full Charge' ? 1 : 0

    sendSocketMessage({
      command_type: 'START_SESSION',
      evse_uid: chargerUsername || 'ev01',
      transactionId: customTxId || '001793695824332',
      isFullCharge,
      paymentMethod: 5,
      plug,
      durations: 0,
      totalKwh: totalKwh.value,
      totalPrice: totalPrice.value,
      actualKwh: 0
    })
  }

  // 7. Payment & Sales Order submission via POST /sale-order/app-tmp
  const isSubmittingOrder = computed(() => createTempOrder.isPending.value)

  const handlePay = async () => {
    const chargerUsername = getChargerUsername()
    const plugId = getPlugId()

    if (!chargerUsername) {
      triggerToast('Please scan a charger QR code first!')
      return
    }

    if (!plugId) {
      triggerToast('Please select a charging plug first!')
      return
    }

    triggerToast(`Processing payment of ${formatNumber(totalPrice.value)} KHR...`)

    try {
      const discountPct =
        (calculatedDiscountPercent.value && calculatedDiscountPercent.value > 0)
          ? calculatedDiscountPercent.value
          : (voucherDiscountPercent.value || 0)

      const orderParams: CreateSaleOrderAppTmpParams = {
        chargerUsername,
        plugId,
        paymentMethod: 1, // ABA PAY default
        discountPercentage: discountPct,
        discount: discountAmount.value,
        voucherId: Number(selectedVoucher.value?.id ?? 0),
        membershipRedeemId: Number(pointsApplied.value ?? 0),
        totalKwh: totalKwh.value,
        totalPrice: subTotal.value,
        grandTotalPrice: totalPrice.value
      }

      const res = await createTempOrder.mutateAsync(orderParams)

      // Validate server business status
      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      if (isSuccess === false) {
        const errorMsg = res?.body?.message || (res as any)?.message || 'Failed to create sales order'
        triggerToast(errorMsg)
        return
      }

      const data: SaleOrderAppTmpData | undefined =
        (res as any)?.data ?? res?.body?.data ?? (res as any)?.body

      const txId = data?.transactionId || '001793695824332'
      const isFullCharge = selectedPreset.value === 'Full Charge' ? 1 : 0

      // Send START_SESSION command via WebSocket upon order creation
      sendSocketMessage({
        command_type: 'START_SESSION',
        evse_uid: chargerUsername,
        transactionId: txId,
        isFullCharge,
        paymentMethod: 5,
        plug: plugId,
        durations: 0,
        totalKwh: totalKwh.value,
        totalPrice: totalPrice.value,
        actualKwh: 0
      })

      const message =
        res?.body?.message ??
        (res as any)?.message ??
        'Sales order created successfully'

      triggerToast(message)

      setTimeout(() => {
        navigateTo({
          path: '/charging',
          query: {
            transactionId: txId,
            chargerCode: chargerUsername,
            plugId: String(plugId)
          }
        })
      }, 1000)
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to create sales order'
      triggerToast(errMsg)
      console.error('Create sales order error:', err)
    }
  }

  // Lifecycle
  onMounted(() => {
    sendTitleToFlutter('Charging Information')
    loadDefaultAccount()
  })

  return {
    // Presets & Mode
    selectedMode,
    setMode,
    kwhPresets: KWH_PRESETS,
    khrPresets: KHR_PRESETS,
    selectedPreset,
    selectPreset,
    inputAmount,
    handleInput,
    formatNumber,

    // Voucher
    voucherList,
    selectedVoucher,
    voucherDiscountPercent,
    isVoucherSheetOpen,
    voucherBadgeText,
    voucherLabelText,
    handleApplyVoucher,
    applyVoucher,

    // Points
    pointsApplied,
    isPointSheetOpen,
    handleApplyPoints,

    // Accounts
    accounts,
    selectedAccountId,
    currentAccount,
    isLoadingAccount,
    isAccountModalOpen,
    selectAccount,
    loadDefaultAccount,

    // Calculations
    subTotal,
    voucherDiscountAmount,
    discountAmount,
    totalPrice,
    totalKwh,

    // Promotion & Order APIs
    calculatePromotion,
    calculatePromotionMutation,
    isCalculatingPromotion,
    createTempOrder,
    isSubmittingOrder,
    handlePay,

    // WebSocket
    socketData,
    socketStatus,
    sendSocketMessage,
    sendHello,

    // Toast
    showToast,
    toastMessage,
    triggerToast
  }
}

