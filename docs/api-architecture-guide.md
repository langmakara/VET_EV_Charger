# API Architecture Guide — TanStack Query + Axios

## Overview

This project uses a **3-layer architecture** to handle API calls:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1 — Axios Client (plugins/axios.client.ts)       │
│  Creates one global HTTP client, auto-attaches auth     │
│  token + language headers on every request              │
├─────────────────────────────────────────────────────────┤
│  Layer 2 — Repositories (apis/*.repository.ts)          │
│  Plain async functions that return Promises              │
│  NOT reactive — just raw HTTP calls                     │
├─────────────────────────────────────────────────────────┤
│  Layer 3 — TanStack Query Hooks (composables/queries/*) │
│  useQuery / useMutation wrappers                        │
│  Reactive, cached, auto-refetch                         │
├─────────────────────────────────────────────────────────┤
│  Layer 4 — Vue Pages / Components                       │
│  Call query hooks, get reactive data                    │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Axios Client

**File:** `plugins/axios.client.ts`

Creates a **single** Axios instance (`$api`) provided to the entire app via Nuxt plugin:

- **Base URL** — resolved from environment config via `useApiUrl()`
- **Request interceptor** — automatically attaches:
  - `Authorization: Bearer <token>` (from cookie/localStorage/URL)
  - `x-lang-id` + `lang-id` headers (from `lang_id` cookie)
- **Response interceptor** — handles:
  - `401` → clears auth token
  - Normalizes error shape (`error.status`, `error.data`)

> **You never import Axios directly.** Use `useApi()` from `HttpFactory.ts` instead.

---

## Layer 2 — Repositories

**Files:** `apis/*.repository.ts`

Each repository is a plain object with methods that:
1. Call `useApi()` to get the Axios instance
2. Make HTTP requests with proper TypeScript generics
3. Return **plain Promises** (unwrapped from Axios response)

### Example — `evCharger.repository.ts`

```typescript
export const evChargerRepository = {
  getStations(params?: ChargingStationListParams) {
    return useApi()
      .get<ApiResponseWrapper<ChargingStationSummary[]>>("/ev-charger/stations", {
        params: cleanParams(params),  // strips undefined/null/"" values
      })
      .then((r) => r.data);  // unwraps axios response → returns API body only
  },

  startCharging(payload: StartChargingPayload) {
    return useApi()
      .post<ApiResponseWrapper<ChargingSession>>("/ev-charger/sessions/start", payload)
      .then((r) => r.data);
  },
};
```

### Key Rules

- Always use `cleanParams()` for query parameters
- Always `.then((r) => r.data)` to unwrap the Axios response envelope
- Use `ApiResponseWrapper<T>` generic for typed responses
- **Never** call these directly from pages — always go through query hooks

---

## Layer 3 — TanStack Query Hooks

**Files:** `composables/queries/*.ts`

Thin reactive wrappers around repositories using `useQuery` and `useMutation`:

### useQuery (for GET requests)

```typescript
export const useStationsQuery = (
  params?: MaybeRefOrGetter<ChargingStationListParams>
) =>
  useQuery({
    queryKey: computed(() => queryKeys.evCharger.stations(toValue(params))),
    queryFn: () => evChargerRepository.getStations(toValue(params)),
  });
```

What you get back:
- `data` — reactive `Ref` with the response data
- `isPending` — `true` while loading
- `isError` — `true` if request failed
- `error` — the error object
- `refetch()` — manually trigger re-fetch

### useMutation (for POST/PUT/DELETE)

```typescript
export const useStartChargingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartChargingPayload) =>
      evChargerRepository.startCharging(payload),
    onSuccess: () => {
      // Invalidate related queries → they auto-refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.evCharger.activeSession(),
      });
    },
  });
};
```

What you get back:
- `mutate(payload)` — fire the mutation
- `mutateAsync(payload)` — fire and await
- `isPending` — `true` while in progress
- `isError` / `error` — error state

---

## Query Keys — `apis/queryKeys.ts`

Centralized key factory so every query and mutation references the **same cache key shape**:

```typescript
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
    stations: (params?) => [...queryKeys.evCharger.all, "stations", params ?? {}] as const,
    stationDetail: (id) => [...queryKeys.evCharger.all, "station-detail", id] as const,
    activeSession: () => [...queryKeys.evCharger.all, "active-session"] as const,
    session: (sessionId) => [...queryKeys.evCharger.all, "session", sessionId] as const,
    sessionHistory: (params?) => [...queryKeys.evCharger.all, "session-history", params ?? {}] as const,
  },
} as const;
```

### Why centralized?

- `useQuery` uses the key for **caching** — same key = same cached data
- `useMutation` uses the key in `onSuccess` for **cache invalidation**
- All in one place = no typos, no cache mismatches

---

## How to Use When Creating a New Page

### Case 1 — Query hook already exists

Just use it directly:

```vue
<!-- app/pages/charging-history.vue -->
<script setup lang="ts">
const { data, isPending, isError } = useSessionHistoryQuery();

const sessions = computed(() => data.value?.data ?? []);
</script>

<template>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="isError">Failed to load</div>
  <div v-else>
    <div v-for="session in sessions" :key="session.id">
      {{ session.id }} — {{ session.status }}
    </div>
  </div>
</template>
```

### Case 2 — Need a NEW endpoint

Follow these 4 steps:

#### Step 1 — Add types (`app/types/`)

```typescript
// types/ev-charger.ts
export interface ChargingPrice {
  connectorId: number;
  pricePerKwh: number;
  currency: string;
}
```

#### Step 2 — Add query key (`apis/queryKeys.ts`)

```typescript
evCharger: {
  // ...existing keys...
  pricing: (connectorId: number | string) =>
    [...queryKeys.evCharger.all, "pricing", connectorId] as const,
},
```

#### Step 3 — Add repository method (`apis/evCharger.repository.ts`)

```typescript
getPricing(connectorId: number | string) {
  return useApi()
    .get<ApiResponseWrapper<ChargingPrice>>(
      `/ev-charger/connectors/${connectorId}/pricing`
    )
    .then((r) => r.data);
},
```

#### Step 4 — Add query hook (`composables/queries/useEvChargerQueries.ts`)

```typescript
export const usePricingQuery = (
  connectorId: MaybeRefOrGetter<number | string | undefined>
) =>
  useQuery({
    queryKey: computed(() =>
      queryKeys.evCharger.pricing(toValue(connectorId) ?? "")
    ),
    queryFn: () =>
      evChargerRepository.getPricing(toValue(connectorId) as number | string),
    enabled: computed(() => !!toValue(connectorId)),
  });
```

#### Step 5 — Use in your page

```vue
<script setup lang="ts">
const route = useRoute();
const connectorId = computed(() => route.params.id);

const { data, isPending } = usePricingQuery(connectorId);
const pricing = computed(() => data.value?.data);
</script>
```

### Case 3 — Need a Mutation (POST/PUT/DELETE)

#### Add repository method

```typescript
updateProfile(payload: UpdateProfilePayload) {
  return useApi()
    .put<ApiResponseWrapper<UserProfile>>("/users/me", payload)
    .then((r) => r.data);
},
```

#### Add mutation hook

```typescript
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      userRepository.updateProfile(payload),
    onSuccess: () => {
      // Invalidate user profile query → auto-refetch fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(),
      });
    },
  });
};
```

#### Use in page

```vue
<script setup lang="ts">
const { mutate: updateProfile, isPending: saving } =
  useUpdateProfileMutation();

const handleSave = () => {
  updateProfile({ name: "New Name", phone: "0812345678" });
};
</script>
```

---

## File Structure Reference

```
apis/
├── HttpFactory.ts              # useApi() — returns axios instance
├── apiHelpers.ts               # cleanParams() — strips empty query params
├── queryKeys.ts                # Centralized cache key factory
├── index.ts                    # Barrel export
├── evCharger.repository.ts     # EV charger API endpoints
├── terms.repository.ts         # Terms/privacy API endpoints
└── user.repository.ts          # User profile API endpoints

composables/queries/
├── useEvChargerQueries.ts      # useQuery/useMutation for EV charger
├── useTermsQueries.ts          # useQuery for terms
└── useUserQueries.ts           # useQuery for user profile
```

## Quick Rules

| ✅ Do | ❌ Don't |
|-------|---------|
| Call query hooks in pages/components | Call repository methods directly in pages |
| Use `queryKeys` for all cache keys | Hand-type key arrays like `["ev-charger", "stations"]` |
| Use `cleanParams()` for query params | Pass raw params with undefined/null values |
| Use `computed()` for reactive query keys | Use static keys with reactive params |
| Invalidate queries in `onSuccess` | Manually refetch after mutations |
| Add types for all API responses | Use `any` for response types |
