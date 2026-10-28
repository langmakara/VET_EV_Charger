/**
 * Centralized TanStack Query Key Factory
 */
export const queryKeys = {
  terms: {
    all: ["terms"] as const,
    privacy: (type?: number) => [...queryKeys.terms.all, "privacy", type ?? 2] as const,
  },

  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
  },

  membership: {
    all: ["membership"] as const,
    benefits: () => [...queryKeys.membership.all, "benefits"] as const,
  },

  evCharger: {
    all: ["ev-charger"] as const,
    stations: (params?: Record<string, any>) =>
      [...queryKeys.evCharger.all, "stations", params ?? {}] as const,
    stationDetail: (id: number | string) =>
      [...queryKeys.evCharger.all, "station-detail", id] as const,
    activeSession: () => [...queryKeys.evCharger.all, "active-session"] as const,
    session: (sessionId: number | string) =>
      [...queryKeys.evCharger.all, "session", sessionId] as const,
    sessionHistory: (params?: Record<string, any>) =>
      [...queryKeys.evCharger.all, "session-history", params ?? {}] as const,
  },

  station: {
    all: ["station"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.station.all, "list", params ?? {}] as const,
    infinite: (params?: Record<string, any>) =>
      [...queryKeys.station.all, "infinite", params ?? {}] as const,
    detail: (id: number | string) =>
      [...queryKeys.station.all, "detail", id] as const,
  },
} as const;
