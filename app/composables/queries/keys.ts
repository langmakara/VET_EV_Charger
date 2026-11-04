/**
 * Centralized TanStack Query Key Factory
 */
export const queryKeys = {
  terms: {
    all: ['terms'] as const,
    privacy: (type?: number) => [...queryKeys.terms.all, 'privacy', type ?? 2] as const
  },

  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const
  },

  profile: {
    all: ['profile'] as const,
    chargingStatus: () => [...queryKeys.profile.all, 'charging-status'] as const
  },

  membership: {
    all: ['membership'] as const,
    benefits: () => [...queryKeys.membership.all, 'benefits'] as const,
    info: () => [...queryKeys.membership.all, 'info'] as const,
    chargeHistory: (params?: Record<string, any>) =>
      [...queryKeys.membership.all, 'charge-history', params ?? {}] as const,
    transactionDetail: (id: number) =>
      [...queryKeys.membership.all, 'transaction-detail', id] as const
  },

  evCharger: {
    all: ['ev-charger'] as const,
    stations: (params?: Record<string, any>) =>
      [...queryKeys.evCharger.all, 'stations', params ?? {}] as const,
    stationDetail: (id: number | string) =>
      [...queryKeys.evCharger.all, 'station-detail', id] as const,
    activeSession: () => [...queryKeys.evCharger.all, 'active-session'] as const,
    session: (sessionId: number | string) =>
      [...queryKeys.evCharger.all, 'session', sessionId] as const,
    sessionHistory: (params?: Record<string, any>) =>
      [...queryKeys.evCharger.all, 'session-history', params ?? {}] as const
  },

  station: {
    all: ['station'] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.station.all, 'list', params ?? {}] as const,
    infinite: (params?: Record<string, any>) =>
      [...queryKeys.station.all, 'infinite', params ?? {}] as const,
    detail: (id: number | string) => [...queryKeys.station.all, 'detail', id] as const,
    pricePerKwh: (params?: Record<string, any>) =>
      [...queryKeys.station.all, 'price-per-kwh', params ?? {}] as const
  },

  voucher: {
    all: ['voucher'] as const,
    infinite: (params?: Record<string, any>) =>
      [...queryKeys.voucher.all, 'infinite', params ?? {}] as const,
    search: (params?: Record<string, any>) =>
      [...queryKeys.voucher.all, 'search', params ?? {}] as const,
    apply: (params?: Record<string, any>) =>
      [...queryKeys.voucher.all, 'apply', params ?? {}] as const
  },

  dropdown: {
    all: ['dropdown'] as const,
    infinite: (params?: Record<string, any>) =>
      [...queryKeys.dropdown.all, 'infinite', params ?? {}] as const,
    newsFeed: (params?: Record<string, any>) =>
      [...queryKeys.dropdown.all, 'news-feed', params ?? {}] as const,
    gunType: (params?: Record<string, any>) =>
      [...queryKeys.dropdown.all, 'gun-type', params ?? {}] as const,
    privacyPolicy: (params?: Record<string, any>) =>
      [...queryKeys.dropdown.all, 'privacy-policy', params ?? {}] as const
  },

  saleOrder: {
    all: ['sale-order'] as const,
    transactionsHistory: (params?: Record<string, any>) =>
      [...queryKeys.saleOrder.all, 'transactions-history', params ?? {}] as const,
    detail: (transactionId: string) =>
      [...queryKeys.saleOrder.all, 'detail', transactionId] as const
  },

  promotion: {
    all: ['promotion'] as const,
    calculate: (params?: Record<string, any>) =>
      [...queryKeys.promotion.all, 'calculate', params ?? {}] as const
  },

  label: {
    all: ['label'] as const,
    kwhList: (params?: Record<string, any>) =>
      [...queryKeys.label.all, 'kwh-list', params ?? {}] as const,
    priceList: (params?: Record<string, any>) =>
      [...queryKeys.label.all, 'price-list', params ?? {}] as const,
    pointList: (params?: Record<string, any>) =>
      [...queryKeys.label.all, 'point-list', params ?? {}] as const
  }
} as const
