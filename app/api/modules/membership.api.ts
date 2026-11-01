import type { AxiosInstance } from "axios";
import type { ApiResponseWrapper, ChargeHistoryData, ChargeHistoryParams, MembershipData, MembershipInfoData, TransactionDetailData } from "../types";

export const MembershipTierApi = (http: AxiosInstance) => ({
  // get membership list
  getMenbershipList: () =>
    http
      .post<ApiResponseWrapper<MembershipData[]>>("/membership/level/list")
      .then((r) => r.data),

  // get membership info
  getMembershipInfo: () =>
    http
      .post<ApiResponseWrapper<MembershipInfoData>>("/membership/info")
      .then((r) => r.data),

  // get charge history
  getChargeHistory: (params?: ChargeHistoryParams) =>
    http
      .post<ApiResponseWrapper<ChargeHistoryData[]>>("/membership/transaction/list", params)
      .then((r) => r.data),

  // find transaction detail by id
  getTransactionDetail: (id: number) =>
    http
      .post<ApiResponseWrapper<TransactionDetailData>>(`/membership/transaction/detail/${id}`, {})
      .then((r) => r.data),
});
