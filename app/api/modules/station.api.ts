import type { AxiosInstance } from "axios";
import type { ApiResponseWrapper, StationData, StationDetailData, StationListParams } from "../types";

export const stationApi = (http: AxiosInstance) => ({
  /**
   * POST /station/list
   */
  getInfiniteStation: (params?: StationListParams) =>
    http
      .post<ApiResponseWrapper<StationData[]>>("/station/list", params)
      .then((r) => r.data),

  /**
   * POST /station/find/{id}
   */
  findStation: (id: number | string) =>
    http
      .post<ApiResponseWrapper<StationDetailData[]>>(`/station/find/${id}`, {})
      .then((r) => r.data),

  /**
   * POST /station/add-favorites/{id}
   */
  addFavorites: (id: number | string) =>
    http
      .post<ApiResponseWrapper>(`/station/add-favorites/${id}`, {})
      .then((r) => r.data),
});

