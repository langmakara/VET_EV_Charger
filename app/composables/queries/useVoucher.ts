import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { VoucherListParams, VoucherSearchParams } from "~/api/types";
import { queryKeys } from "./keys";
import { voucherApi } from "~/api/modules/voucher.api";
import { computed, unref, type MaybeRef } from "vue";
import { useApi } from "~/composables/useApi";

export const useVoucherInfinite = (params?: MaybeRef<VoucherListParams>) => {
  const http = useApi();
  const api = voucherApi(http);

  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.voucher.infinite(unref(params))),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.getInfiniteVoucher({
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

export const useSearchVoucherQuery = (
  params: MaybeRef<VoucherSearchParams | { code: string } | string | undefined | null>,
  options?: { enabled?: MaybeRef<boolean> },
) => {
  const http = useApi();
  const api = voucherApi(http);
  const normalizedParams = computed<VoucherSearchParams | undefined>(() => {
    const raw = unref(params);
    if (!raw) return undefined;
    if (typeof raw === "string") {
      return { code: raw };
    }
    return raw;
  });

  return useQuery({
    queryKey: computed(() => queryKeys.voucher.search(normalizedParams.value ?? {})),
    queryFn: () => api.searchVoucher(normalizedParams.value!),
    enabled: computed(() => {
      const isCustomEnabled =
        options?.enabled !== undefined ? unref(options.enabled) : true;
      return !!normalizedParams.value?.code && isCustomEnabled;
    }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchVoucherMutation = () => {
  const http = useApi();
  const api = voucherApi(http);

  return useMutation({
    mutationFn: (params: VoucherSearchParams | { code: string } | string) => {
      const payload: VoucherSearchParams =
        typeof params === "string" ? { code: params } : params;
      return api.searchVoucher(payload);
    },
  });
};

export const useApplyVoucherMutation = () => {
  const http = useApi();
  const api = voucherApi(http);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: VoucherSearchParams | { code: string } | string) => {
      const payload: VoucherSearchParams =
        typeof params === "string" ? { code: params } : params;
      return api.applyVoucher(payload);
    },
    onSuccess: (data: any) => {
      const isSuccess = Boolean(
        (data?.body?.status ?? data?.header?.result ?? data?.status) === true
      );
      if (isSuccess) {
        queryClient.invalidateQueries({ queryKey: queryKeys.voucher.all });
      }
    },
  });
};
