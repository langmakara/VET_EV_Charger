/**
 * TanStack Query hooks for the EV charger domain.
 * Thin reactive wrappers around `~/apis/evCharger.repository.ts`.
 */
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { evChargerRepository } from "~/apis/evCharger.repository";
import { queryKeys } from "~/apis/queryKeys";
import type {
  ChargingStationListParams,
  SessionHistoryParams,
  StartChargingPayload,
} from "~/types/ev-charger";

export const useStationsQuery = (params?: MaybeRefOrGetter<ChargingStationListParams>) =>
  useQuery({
    queryKey: computed(() => queryKeys.evCharger.stations(toValue(params))),
    queryFn: () => evChargerRepository.getStations(toValue(params)),
  });

export const useStationDetailQuery = (id: MaybeRefOrGetter<number | string | undefined>) =>
  useQuery({
    queryKey: computed(() => queryKeys.evCharger.stationDetail(toValue(id) ?? "")),
    queryFn: () => evChargerRepository.getStationDetail(toValue(id) as number | string),
    enabled: computed(() => !!toValue(id)),
  });

/**
 * The active charging session card on the home page. Polls every 5s while a
 * session is in progress so the battery % / status stays live; set
 * `enabled: false` (e.g. once the page is backgrounded) to pause it.
 */
export const useActiveSessionQuery = (options?: { enabled?: MaybeRefOrGetter<boolean> }) =>
  useQuery({
    queryKey: queryKeys.evCharger.activeSession(),
    queryFn: () => evChargerRepository.getActiveSession(),
    enabled: options?.enabled ? computed(() => toValue(options.enabled)) : true,
    refetchInterval: (query) => (query.state.data?.data ? 5000 : false),
  });

export const useSessionHistoryQuery = (params?: MaybeRefOrGetter<SessionHistoryParams>) =>
  useQuery({
    queryKey: computed(() => queryKeys.evCharger.sessionHistory(toValue(params))),
    queryFn: () => evChargerRepository.getSessionHistory(toValue(params)),
  });

export const useStartChargingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartChargingPayload) => evChargerRepository.startCharging(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evCharger.activeSession() });
    },
  });
};

export const useStopChargingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number | string) => evChargerRepository.stopCharging(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evCharger.activeSession() });
      queryClient.invalidateQueries({ queryKey: queryKeys.evCharger.sessionHistory() });
    },
  });
};
