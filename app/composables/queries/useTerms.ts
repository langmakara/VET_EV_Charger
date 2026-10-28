import { computed, unref, type MaybeRef } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useApi } from "~/composables/useApi";
import { termsApi } from "~/api/modules/terms.api";
import { queryKeys } from "./keys";

export const usePrivacyTermsQuery = (type: MaybeRef<number> = 2) => {
  const http = useApi();
  const api = termsApi(http);
  const typeRef = computed(() => unref(type));

  return useQuery({
    queryKey: computed(() => queryKeys.terms.privacy(typeRef.value)),
    queryFn: () => api.getPrivacyTerms(typeRef.value),
    staleTime: 10 * 60 * 1000,
  });
};
