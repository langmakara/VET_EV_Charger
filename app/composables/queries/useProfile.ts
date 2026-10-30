import { useQuery } from "@tanstack/vue-query";
import { profileApi } from "~/api/modules/profile.api";
import { queryKeys } from "./keys";
import { useApi } from "~/composables/useApi";

/**
 * Check if the current customer is charging (1) or not (0)
 * POST /profile/charging-status
 */
export const useChargingStatusQuery = (options?: { enabled?: boolean; refetchInterval?: number }) => {
  const http = useApi();
  const api = profileApi(http);

  return useQuery({
    queryKey: queryKeys.profile.chargingStatus(),
    queryFn: () => api.getChargingStatus(),
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
  });
};

