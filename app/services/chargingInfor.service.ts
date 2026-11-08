import { ref, computed, watch, onMounted, type Ref, type ComputedRef } from 'vue'
import { useRoute, navigateTo } from '#app'
// import { sendTitleToFlutter, abaBridge } from '~/composables/useNativeBridge'
import {
  ABABridgeService,
  type ABADefaultAccResponse,
  type ABAGetDefaultAccPayload,
  type ABAPaymentPayload
} from '@/services/abaBridge'
import { useVoucherInfinite } from '~/composables/queries/useVoucher'
import { useCalculatePromotionMutation } from '~/composables/queries/usePromotion'
import { useCreateSaleOrderAppTmpMutation } from '~/composables/queries/useSaleOrder'
import { useStationPricePerKwhMutation } from '~/composables/queries/useStation'
import { useKwhLabelsMutation, usePriceLabelsMutation } from '~/composables/queries/useLabel'
import { useGeneratePaymentHashMutation } from '~/composables/queries/useAba'
import { useWebSocket } from '~/composables/useChargintSocket'
import type {
  VoucherDate,
  CreateSaleOrderAppTmpParams,
  SaleOrderAppTmpData,
  PromotionCalculateParams,
  PromotionCalculateData,
  LabelData
} from '~/api/types'
import { useABAMiniApp } from '@/composables/useNativeBridge'

export interface AccountItem {
  id: string
  name: string
  number: string
  currency: string
  isDefault?: boolean
  color: string
}

// Utilities
export const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('en-US')
}

// Helper to normalize account payload from ABA native bridge
export function normalizeAbaAccount(item: any, index = 0): AccountItem {
  const number =
    item.accountNumber ?? item.account ?? item.acc ?? item.number ?? item.accNo ?? item.id ?? ''

  const name =
    item.accountName ??
    item.accName ??
    item.name ??
    item.title ??
    ''

  const currency = item.currency ?? 'KHR'
  const id = String(item.id ?? number ?? '')
  const isDefault = item.useDefault ?? item.isDefault ?? false
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
    const raw = route.query.plugId || route.query.plug_id || route.query.gunId || route.query.gun_id
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

  // Station Price Per kWh from API (useStationPricePerKwhMutation)
  const pricePerKwhMutation = useStationPricePerKwhMutation()
  const pricePerKwh = ref<number>(0)
  const isFetchingPricePerKwh = computed(() => pricePerKwhMutation.isPending.value)
  let lastFetchedKey = ''

  const fetchPricePerKwh = async (force = false) => {
    const chargerUserName = getChargerUsername()
    const plugId = getPlugId()

    if (!chargerUserName) return

    const cacheKey = `${chargerUserName}_${plugId}`
    if (!force && (lastFetchedKey === cacheKey || pricePerKwhMutation.isPending.value)) {
      return
    }

    lastFetchedKey = cacheKey

    try {
      const res = await pricePerKwhMutation.mutateAsync({
        chargerUserName,
        plugId
      })

      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      const data = (res as any)?.data ?? res?.body?.data ?? (res as any)?.body
      const rate = data?.pricePerKwh ?? data?.price_per_kwh

      if (isSuccess !== false && rate != null && Number(rate) > 0) {
        pricePerKwh.value = Number(rate)
      }
    } catch (err) {
      console.warn('Failed to fetch price per kWh:', err)
      lastFetchedKey = '' // Allow retry on failure
    }
  }

  // kWh Labels from API (useKwhLabelsMutation)
  const kwhLabelsMutation = useKwhLabelsMutation()
  const kwhLabelList = ref<LabelData[]>([])
  const kwhPresets = ref<string[]>([])
  const isFetchingKwhLabels = computed(() => kwhLabelsMutation.isPending.value)
  let hasFetchedKwhLabels = false

  const fetchKwhPresets = async (force = false) => {
    if (!force && (hasFetchedKwhLabels || kwhLabelsMutation.isPending.value)) {
      return
    }
    hasFetchedKwhLabels = true

    try {
      const res = await kwhLabelsMutation.mutateAsync({})
      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      const data: LabelData[] | undefined =
        (res as any)?.data ?? res?.body?.data ?? (res as any)?.body

      if (isSuccess !== false && Array.isArray(data) && data.length > 0) {
        kwhLabelList.value = data
        kwhPresets.value = data.map((item) => {
          if (item.isFullCharge === 1) {
            return item.name || 'Full Charge'
          }
          return item.name || `${item.value} kWh`
        })

        if (selectedMode.value === 'kwh') {
          const matched = kwhPresets.value.find((p) => p === selectedPreset.value)
          if (!matched && kwhPresets.value[0]) {
            selectPreset(kwhPresets.value[0])
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch kWh labels:', err)
      hasFetchedKwhLabels = false
    }
  }

  // Price (KHR) Labels from API (usePriceLabelsMutation)
  const priceLabelsMutation = usePriceLabelsMutation()
  const priceLabelList = ref<LabelData[]>([])
  const khrPresets = ref<string[]>([])
  const isFetchingPriceLabels = computed(() => priceLabelsMutation.isPending.value)
  let hasFetchedPriceLabels = false

  const fetchPricePresets = async (force = false) => {
    if (!force && (hasFetchedPriceLabels || priceLabelsMutation.isPending.value)) {
      return
    }
    hasFetchedPriceLabels = true

    try {
      const res = await priceLabelsMutation.mutateAsync({})
      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      const data: LabelData[] | undefined =
        (res as any)?.data ?? res?.body?.data ?? (res as any)?.body

      if (isSuccess !== false && Array.isArray(data) && data.length > 0) {
        priceLabelList.value = data
        khrPresets.value = data.map((item) => {
          if (item.isFullCharge === 1) {
            return item.name || 'Full Charge'
          }
          return item.name || `${formatNumber(item.value)} KHR`
        })

        if (selectedMode.value === 'khr') {
          const matched = khrPresets.value.find((p) => p === selectedPreset.value)
          if (!matched && khrPresets.value[0]) {
            selectPreset(khrPresets.value[0])
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch price labels:', err)
      hasFetchedPriceLabels = false
    }
  }

  onMounted(() => {
    fetchPricePerKwh()
    fetchKwhPresets()
    fetchPricePresets()
    loadDefaultAccount()
  })

  watch(
    () => `${getChargerUsername()}_${getPlugId()}`,
    (newKey, oldKey) => {
      if (newKey && newKey !== oldKey) {
        fetchPricePerKwh()
      }
    }
  )

  // 1. Mode & Presets
  const selectedMode = ref<'kwh' | 'khr'>('kwh')
  const selectedPreset = ref<string>('')
  const inputAmount = ref<string>('')

  const setMode = (mode: 'kwh' | 'khr') => {
    selectedMode.value = mode
    if (mode === 'kwh') {
      const defaultKwh = kwhPresets.value[0] || ''
      selectPreset(defaultKwh)
    } else {
      const defaultKhr = khrPresets.value[0] || ''
      selectPreset(defaultKhr)
    }
  }

  const selectPreset = (preset: string) => {
    selectedPreset.value = preset
    if (!preset) {
      inputAmount.value = ''
      return
    }

    if (selectedMode.value === 'kwh') {
      const matched = kwhLabelList.value.find(
        (l) => l.name === preset || `${l.value} kWh` === preset
      )
      if (matched?.isFullCharge === 1 || preset === 'Full Charge') {
        inputAmount.value = matched?.value != null ? String(matched.value) : ''
      } else if (matched?.value != null) {
        inputAmount.value = String(matched.value)
      } else {
        inputAmount.value = preset.replace(/[^0-9]/g, '')
      }
    } else {
      const matchedPrice = priceLabelList.value.find(
        (p) => p.name === preset || `${formatNumber(p.value)} KHR` === preset
      )
      if (matchedPrice?.isFullCharge === 1 || preset === 'Full Charge') {
        inputAmount.value =
          matchedPrice?.value != null && matchedPrice.value > 0
            ? String(matchedPrice.value)
            : ''
      } else if (matchedPrice?.value != null) {
        inputAmount.value = String(matchedPrice.value)
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
      const match = kwhPresets.value.find((p) => {
        const num = p.replace(/[^0-9]/g, '')
        return num === rawValue || p === `${rawValue} kWh`
      })
      selectedPreset.value = match || ''
    } else {
      const formatted = formatNumber(Number(rawValue))
      const match = khrPresets.value.find((p) => {
        const num = p.replace(/[^0-9]/g, '')
        return num === rawValue || p === `${formatted} KHR`
      })
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
      voucherDiscountPercent.value =
        v.discountType === 1 || v.discountType == null ? discountVal : 0
      if (showNotification) {
        const discountLabel =
          v.discountType === 2 ? `${formatNumber(discountVal)} KHR OFF` : `${discountVal}% OFF`
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
                (v.voucherId != null &&
                  String(v.voucherId) === String(selectedVoucher.value?.voucherId)) ||
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

  const handleApplyVoucher = (payload: {
    voucher: VoucherDate | null
    percent: number
    code: string
  }) => {
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
  const calculatedDiscountAmount = ref<number>(0)
  const calculatedDiscountPercent = ref<number>(0)
  const isCalculatingPromotion = ref(false)

  const subTotal = computed(() => {
    const val = Number(inputAmount.value) || 0
    if (selectedMode.value === 'kwh') {
      return val * pricePerKwh.value
    }
    return val
  })

  // Discount is retrieved directly from API response (/promotion/calculate)
  const discountAmount = computed(() => {
    return Number(calculatedDiscountAmount.value ?? 0)
  })

  const voucherDiscountAmount = discountAmount

  const totalPrice = computed(() => {
    return Math.max(0, subTotal.value - discountAmount.value)
  })

  const totalKwh = computed(() => {
    if (selectedMode.value === 'kwh') {
      return Number(inputAmount.value) || 0
    }
    return pricePerKwh.value > 0 ? (Number(inputAmount.value) || 0) / pricePerKwh.value : 0
  })

  const voucherBadgeText = computed(() => {
    if (!selectedVoucher.value) {
      return 'None'
    }
    const pct = Number(calculatedDiscountPercent.value ?? 0)
    if (pct > 0) {
      return `${pct}% OFF`
    }
    const amt = Number(calculatedDiscountAmount.value ?? 0)
    if (amt > 0) {
      return `${formatNumber(amt)} KHR OFF`
    }
    const val = Number(selectedVoucher.value.discountValue ?? 0)
    if (val > 0) {
      return selectedVoucher.value.discountType === 2
        ? `${formatNumber(val)} KHR OFF`
        : `${val}% OFF`
    }
    return selectedVoucher.value.batchTitle || 'Applied'
  })

  const voucherLabelText = computed(() => {
    const pct = Number(calculatedDiscountPercent.value ?? 0)
    if (pct > 0) {
      return `(${pct}%)`
    }
    const amt = Number(calculatedDiscountAmount.value ?? 0)
    if (amt > 0 && selectedVoucher.value?.discountType === 2) {
      return `(${formatNumber(amt)} KHR)`
    }
    return ''
  })

  // Calculate promotion discount via POST /promotion/calculate
  const calculatePromotion = async () => {
    const chargerUserName = getChargerUsername()
    const plugId = getPlugId()
    const amountKh = subTotal.value

    if (!chargerUserName || amountKh <= 0) {
      calculatedDiscountAmount.value = 0
      calculatedDiscountPercent.value = 0
      return
    }

    isCalculatingPromotion.value = true
    try {
      const voucherId = Number(selectedVoucher.value?.voucherId ?? 0)
      const res = await calculatePromotionMutation.mutateAsync({
        chargerUserName,
        voucherId,
        redeemId: Number(pointsApplied.value ?? 0),
        amountKh,
        plugId
      })

      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      const data: PromotionCalculateData | undefined =
        (res as any)?.data ?? res?.body?.data ?? (res as any)?.body

      if (isSuccess !== false && data) {
        calculatedDiscountAmount.value = Number(data.discountAmountKhr ?? 0)
        calculatedDiscountPercent.value = Number(data.discountPercentage ?? 0)
      } else {
        calculatedDiscountAmount.value = 0
        calculatedDiscountPercent.value = 0
      }
    } catch (err) {
      console.warn('Promotion calculate error:', err)
      calculatedDiscountAmount.value = 0
      calculatedDiscountPercent.value = 0
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

  // Active default account fetched from ABA API #2
  const activeAccount = ref<ABADefaultAccResponse | null>(null)
  const accountChecked = ref(false)
  const accountCurrency = ref<'USD' | 'KHR'>('KHR')

  // Load default account from ABA bridge (API #2: getDefaultAcc)
  const loadDefaultAccount = async () => {
    isLoadingAccount.value = true
    accountChecked.value = false
    try {
      const payload: ABAGetDefaultAccPayload = {
        currency: accountCurrency.value,
        amount: totalPrice.value > 0 ? String(totalPrice.value) : '0'
      }
      const res = await ABABridgeService.getDefaultAcc(payload)
      activeAccount.value = res
      accountChecked.value = true

      if (res && res.accountNumber) {
        const normalized = normalizeAbaAccount(
          {
            accountNumber: res.accountNumber,
            accountName: res.accountName || '',
            currency: res.currency || accountCurrency.value,
            useDefault: true
          },
          0
        )
        accounts.value = [normalized]
        selectedAccountId.value = normalized.id
      }
    } catch (err) {
      console.warn('Failed to get default account from ABA bridge:', err)
      activeAccount.value = null
      accountChecked.value = true
    } finally {
      isLoadingAccount.value = false
    }
  }

  // 8. WebSocket for OCPI commands
  const config = useRuntimeConfig()
  const rawWsUrl = (config.public?.webSocketUrl as string) || ''
  const wsUrl = rawWsUrl
    ? (rawWsUrl.startsWith('ws://') || rawWsUrl.startsWith('wss://') ? rawWsUrl : `wss://${rawWsUrl}/OCPI/ws`)
    : 'wss://qacltom.udaya-tech.com/OCPI/ws'

  const {
    data: socketData,
    status: socketStatus,
    send: sendSocketMessage
  } = useWebSocket(wsUrl, {
    evseUid: computed(() => getChargerUsername())
  })

  watch(socketData, (msg) => {
    console.log('[chargingInfor] Received WebSocket message:', msg)
  })

  function sendHello(customTxId?: string) {
    const chargerUsername = getChargerUsername()
    const plug = getPlugId()
    const isFullCharge = selectedPreset.value === 'Full Charge' ? 1 : 0

    sendSocketMessage({
      command_type: 'START_SESSION',
      evse_uid: chargerUsername,
      transactionId: customTxId,
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
      const discountPct = Number(calculatedDiscountPercent.value ?? 0)
      const voucherId = Number(selectedVoucher.value?.voucherId ?? 0)

      const orderParams: CreateSaleOrderAppTmpParams = {
        chargerUsername,
        plugId,
        paymentMethod: 5, // ABA PAY default
        discountPercentage: discountPct,
        discount: discountAmount.value,
        voucherId,
        membershipRedeemId: Number(pointsApplied.value ?? 0),
        totalKwh: totalKwh.value,
        totalPrice: subTotal.value,
        grandTotalPrice: totalPrice.value
      }

      const res = await createTempOrder.mutateAsync(orderParams)

      // Validate server business status
      const isSuccess = res?.body?.status ?? (res as any)?.status ?? res?.success
      if (isSuccess === false) {
        const errorMsg =
          res?.body?.message || (res as any)?.message || 'Failed to create sales order'
        triggerToast(errorMsg)
        return
      }

      const data: SaleOrderAppTmpData | undefined =
        (res as any)?.data ?? res?.body?.data ?? (res as any)?.body

      const txId = data?.transactionId
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
        res?.body?.message ?? (res as any)?.message ?? 'Sales order created successfully'

      triggerToast(message)

      if (typeof window !== 'undefined') {
        if (totalKwh.value) {
          sessionStorage.setItem('vet_ev_total_kwh', String(totalKwh.value))
        }
        if (pricePerKwh.value) {
          sessionStorage.setItem('vet_ev_price_per_kwh', String(pricePerKwh.value))
        }
      }

      setTimeout(() => {
        navigateTo({
          path: '/charging',
          query: {
            transactionId: txId,
            chargerCode: chargerUsername,
            plugId: String(plugId),
            totalKwh: String(totalKwh.value || ''),
            pricePerKwh: String(pricePerKwh.value || '')
          }
        })
      }, 1000)
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to create sales order'
      triggerToast(errMsg)
      console.error('Create sales order error:', err)
    }
  }

  // --- Transaction Utility: Decimal Formatter --
  const formatToTwoDecimals = (value: number): string => {
    return value.toFixed(2)
  }

  // ==========================================
  // doPayment
  // ==========================================
  const { executePayment } = useABAMiniApp()
  const generatePaymentHashMutation = useGeneratePaymentHashMutation()

  const PaymentTrigger = async (useDefault: boolean = false) => {
    try {
      const acc = currentAccount.value?.number || activeAccount.value?.accountNumber || ''
      if (!acc && !useDefault) {
        triggerToast('Please select a payment account')
        return
      }

      const stringifiedAmount = totalPrice.value.toFixed(2)
      const currency = accountCurrency.value || 'KHR'

      // 1. Fetch payment hash strictly from backend API (/aba-mini-app/payment/hash)
      const hashRes = await generatePaymentHashMutation.mutateAsync({
        account: acc,
        amount: stringifiedAmount,
        currency: currency as 'USD' | 'KHR'
      })

      const hashData = (hashRes as any)?.data ?? hashRes?.body?.data
      const paymentHash =
        hashData?.hash ||
        (typeof hashData === 'string' ? hashData : (hashRes as any)?.hash || '')

      if (!paymentHash) {
        triggerToast('Failed to retrieve payment hash from server')
        return
      }

      // 2. Prepare payload using API-generated hash key
      const paymentPayload: ABAPaymentPayload = {
        amount: stringifiedAmount,
        account: acc,
        currency: currency as 'USD' | 'KHR',
        useDefault: useDefault,
        additionalKey: {
          hash: paymentHash
        }
      }

      // 3. Trigger native payment
      await executePayment(paymentPayload)
      triggerToast('Payment initiated')
    } catch (err: any) {
      console.error('Payment error:', err)
      triggerToast(err?.message || 'Payment failed')
    }
  }

  return {
    // Presets & Mode
    selectedMode,
    setMode,
    kwhPresets,
    khrPresets,
    selectedPreset,
    selectPreset,
    inputAmount,
    handleInput,
    formatNumber,

    // Labels API
    kwhLabelList,
    fetchKwhPresets,
    isFetchingKwhLabels,
    kwhLabelsMutation,
    priceLabelList,
    fetchPricePresets,
    isFetchingPriceLabels,
    priceLabelsMutation,

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
    activeAccount,
    accountChecked,
    accountCurrency,
    isLoadingAccount,
    loadDefaultAccount,
    PaymentTrigger,

    // Calculations
    subTotal,
    voucherDiscountAmount,
    discountAmount,
    totalPrice,
    totalKwh,

    // Station Price Per kWh
    pricePerKwh,
    fetchPricePerKwh,
    isFetchingPricePerKwh,
    pricePerKwhMutation,

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
