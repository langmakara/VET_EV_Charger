/**
 * Terms Repository
 *
 * Consume through `~/composables/queries/useTermsQueries.ts`.
 */
import { useApi } from "./HttpFactory";
import type { ApiResponseWrapper } from "~/types/api";

export const termsRepository = {
  /**
   * GET /masterdata/privacy-terms
   */
  getPrivacyTerms(type: number = 2) {
    return useApi()
      .get<ApiResponseWrapper<unknown>>("/masterdata/privacy-terms", { params: { type } })
      .then((r) => r.data);
  },
};
