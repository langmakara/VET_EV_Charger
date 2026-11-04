import type { AxiosInstance } from "axios";
import type {
  ApiResponseWrapper,
  StationData,
  StationDetailData,
  StationListParams,
  StationPricePerKwhParams,
  StationPricePerKwhData
} from "../types";

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

  /**
   * POST /station/price-per-kwh
   * Resolves the station from chargers.username and returns stations.price_per_kwh.
   */
  getPricePerKwh: (params: StationPricePerKwhParams) =>
    http
      .post<ApiResponseWrapper<StationPricePerKwhData>>("/station/price-per-kwh", params)
      .then((r) => r.data),
});
