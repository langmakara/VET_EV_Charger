import type { AxiosInstance } from "axios";
import type { ApiResponseWrapper, ChargeHistoryParams, SaleOrderDetailData, WalletTransactionData } from "../types";

export const SaleOrderApi = (http: AxiosInstance) => ({
    // get transactions history
    getTransactionsHistory: (params?: ChargeHistoryParams) =>
        http
            .post<ApiResponseWrapper<WalletTransactionData>>("/sale-order/wallet/list", params)
            .then((r) => r.data),

    // find sale order by transactionId
    findSaleOrderByTransactionId: (transactionId: string) =>
        http
            .post<ApiResponseWrapper<SaleOrderDetailData[]>>(`/sale-order/find/${transactionId}`, {})
            .then((r) => r.data)
});
