import type { AxiosInstance } from "axios";
import type { ApiResponseWrapper, ChargingStatusData } from "../types";

export const profileApi = (http: AxiosInstance) => ({
  // post /profile/charging-status (Check if the current customer is charging 1 or 0)
  getChargingStatus: () =>
    http
      .post<ApiResponseWrapper<ChargingStatusData>>("/profile/charging-status")
      .then((r) => r.data),
});
