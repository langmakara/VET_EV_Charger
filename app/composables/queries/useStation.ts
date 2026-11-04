import { computed, unref, type MaybeRef } from "vue";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { StationListParams, StationPricePerKwhParams } from "~/api/types";
import { useApi } from "~/composables/useApi";
import { stationApi } from "~/api/modules/station.api";
import { queryKeys } from "./keys";

export const useStationInfinite = (params?: MaybeRef<StationListParams>) => {
  const http = useApi();
  const api = stationApi(http);

  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.station.infinite(unref(params))),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.getInfiniteStation({
        ...unref(params),
        page: pageParam as number,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const res = (lastPage as any)?.data ?? lastPage?.body?.data;
      const items = Array.isArray(res) ? res : res?.list ?? [];
      const rowsPerPage = unref(params)?.rowsPerPage ?? 25;

      // If fewer items than rowsPerPage were returned, we reached the end
      if (!items || items.length < rowsPerPage) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFindStationQuery = (
  id: MaybeRef<number | string | undefined | null>,
  options?: { enabled?: MaybeRef<boolean> },
) => {
  const http = useApi();
  const api = stationApi(http);
  const idRef = computed(() => unref(id));

  return useQuery({
    queryKey: computed(() => queryKeys.station.detail(idRef.value ?? "")),
    queryFn: () => api.findStation(idRef.value!),
    enabled: computed(() => {
      const isCustomEnabled =
        options?.enabled !== undefined ? unref(options.enabled) : true;
      return !!idRef.value && isCustomEnabled;
    }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddFavoritesMutation = () => {
  const http = useApi();
  const api = stationApi(http);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => api.addFavorites(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.station.all });
    },
  });
};

export const useStationPricePerKwhQuery = (
  params: MaybeRef<StationPricePerKwhParams | undefined | null>,
  options?: { enabled?: MaybeRef<boolean> },
) => {
  const http = useApi();
  const api = stationApi(http);

  return useQuery({
    queryKey: computed(() => queryKeys.station.pricePerKwh(unref(params) || {})),
    queryFn: () => {
      const p = unref(params);
      if (!p) throw new Error("Params required");
      return api.getPricePerKwh(p);
    },
    enabled: computed(() => {
      const p = unref(params);
      const isCustomEnabled =
        options?.enabled !== undefined ? unref(options.enabled) : true;
      return !!p?.chargerUserName && isCustomEnabled;
    }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useStationPricePerKwhMutation = (options?: Record<string, any>) => {
  const http = useApi();
  const api = stationApi(http);

  return useMutation({
    mutationFn: (params: StationPricePerKwhParams) => api.getPricePerKwh(params),
    ...options,
  });
};
