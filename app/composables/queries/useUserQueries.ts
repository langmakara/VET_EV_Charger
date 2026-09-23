/**
 * TanStack Query hook for the user domain.
 *
 * For a *reactive* profile read inside a component/page. Route middleware
 * still uses the imperative `~/composables/useUserProfile.ts` (fetch-once,
 * cache-in-useState) since middleware needs an awaited value, not a Vue Query
 * subscription.
 */
import { useQuery } from "@tanstack/vue-query";
import { userRepository } from "~/apis/user.repository";
import { queryKeys } from "~/apis/queryKeys";

export const useUserProfileQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => userRepository.getUserProfile(),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
