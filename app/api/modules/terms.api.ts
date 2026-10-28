import type { AxiosInstance } from "axios";
import type { ApiResponseWrapper, PrivacyTermsData } from "../types";

export const termsApi = (http: AxiosInstance) => ({
  /**
   * GET /masterdata/privacy-terms
   */
  getPrivacyTerms: (type: number = 2) =>
    http
      .get<ApiResponseWrapper<PrivacyTermsData>>("/masterdata/privacy-terms", {
        params: { type },
      })
      .then((r) => r.data),
});
