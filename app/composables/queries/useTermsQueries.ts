/**
 * TanStack Query hooks for the terms/privacy domain.
 */
import { useQuery } from "@tanstack/vue-query";
import { termsRepository } from "~/apis/terms.repository";
import { queryKeys } from "~/apis/queryKeys";

export const usePrivacyTermsQuery = (type: number = 2) =>
  useQuery({
    queryKey: queryKeys.terms.privacy(type),
    queryFn: () => termsRepository.getPrivacyTerms(type),
    staleTime: 10 * 60 * 1000, // legal copy doesn't change often
  });
