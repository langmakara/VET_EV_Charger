/**
 * TanStack Query hooks for the membership domain.
 * Thin reactive wrappers around `~/apis/membership.repository.ts`.
 */
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { membershipRepository } from "~/apis/membership.repository";
import { queryKeys } from "~/apis/queryKeys";

export const useMembershipBenefitsQuery = (options?: {
  enabled?: MaybeRefOrGetter<boolean>;
}) =>
  useQuery({
    queryKey: queryKeys.membership.benefits(),
    queryFn: () => membershipRepository.getMembershipBenefits(),
    enabled: options?.enabled ? computed(() => toValue(options.enabled)) : true,
    staleTime: 5 * 60 * 1000,
  });
