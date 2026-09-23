/**
 * Centralized TanStack Query key factory.
 *
 * Keeping every domain's keys in one place makes cache invalidation
 * (`queryClient.invalidateQueries`) reliable — mutations and queries always
 * reference the same key shape instead of hand-typed arrays scattered across
 * composables.
 */
export const queryKeys = {

  terms: {
    all: ["terms"] as const,
    privacy: (type: number) => [...queryKeys.terms.all, "privacy", type] as const,
  },

  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
  },

  evCharger: {
    all: ["ev-charger"] as const,
    stations: (params?: Record<string, any>) =>
      [...queryKeys.evCharger.all, "stations", params ?? {}] as const,
    stationDetail: (id: number | string) => [...queryKeys.evCharger.all, "station-detail", id] as const,
    activeSession: () => [...queryKeys.evCharger.all, "active-session"] as const,
    session: (sessionId: number | string) => [...queryKeys.evCharger.all, "session", sessionId] as const,
    sessionHistory: (params?: Record<string, any>) =>
      [...queryKeys.evCharger.all, "session-history", params ?? {}] as const,
  },
} as const;
