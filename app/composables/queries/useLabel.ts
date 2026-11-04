import { computed, unref, type MaybeRef } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";
import type { LabelData } from "~/api/types";
import { useApi } from "~/composables/useApi";
import { labelApi } from "~/api/modules/label.api";
import { queryKeys } from "./keys";

export const useKwhLabelsQuery = (
  params?: MaybeRef<Record<string, any> | undefined>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi();
  const api = labelApi(http);

  return useQuery({
    queryKey: computed(() => queryKeys.label.kwhList(unref(params))),
    queryFn: () => api.getKwhLabels(unref(params)),
    enabled: computed(() => {
      const isCustomEnabled =
        options?.enabled !== undefined ? unref(options.enabled) : true;
      return isCustomEnabled;
    }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useKwhLabelsMutation = () => {
  const http = useApi();
  const api = labelApi(http);

  return useMutation({
    mutationFn: (params?: Record<string, any>) => api.getKwhLabels(params),
  });
};


export const usePriceLabelsQuery = (
  params?: MaybeRef<Record<string, any> | undefined>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi();
  const api = labelApi(http);

  return useQuery({
    queryKey: computed(() => queryKeys.label.priceList(unref(params))),
    queryFn: () => api.getPriceLabels(unref(params)),
    enabled: computed(() => {
      const isCustomEnabled =
        options?.enabled !== undefined ? unref(options.enabled) : true;
      return isCustomEnabled;
    }),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePriceLabelsMutation = () => {
  const http = useApi();
  const api = labelApi(http);

  return useMutation({
    mutationFn: (params?: Record<string, any>) => api.getPriceLabels(params),
  });
};

export const usePointLabelsQuery = (
  params?: MaybeRef<Record<string, any> | undefined>,
  options?: { enabled?: MaybeRef<boolean> }
) => {
  const http = useApi();
  const api = labelApi(http);

  return useQuery({
    queryKey: computed(() => queryKeys.label.pointList(unref(params))),
    queryFn: () => api.getPointLabels(unref(params)),
    enabled: computed(() => {
      const isCustomEnabled =
        options?.enabled !== undefined ? unref(options.enabled) : true;
      return isCustomEnabled;
    }),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePointLabelsMutation = () => {
  const http = useApi();
  const api = labelApi(http);

  return useMutation({
    mutationFn: (params?: Record<string, any>) => api.getPointLabels(params),
  });
};


