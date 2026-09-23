/**
 * EV Charger Repository
 *
 * Endpoint paths are placeholders — adjust to match the real backend once
 * confirmed; everything else (auth header, lang header, base URL, error
 * normalization) is already handled by `useApi()`.
 */
import { useApi } from "./HttpFactory";
import { cleanParams } from "./apiHelpers";
import type { ApiResponseWrapper } from "~/types/api";
import type {
  ChargingSession,
  ChargingStationListParams,
  ChargingStationSummary,
  SessionHistoryParams,
  StartChargingPayload,
} from "~/types/ev-charger";

export const evChargerRepository = {
  /**
   * GET /ev-charger/stations
   */
  getStations(params?: ChargingStationListParams) {
    return useApi()
      .get<ApiResponseWrapper<ChargingStationSummary[]>>("/ev-charger/stations", {
        params: cleanParams(params),
      })
      .then((r) => r.data);
  },

  /**
   * GET /ev-charger/stations/{id}
   */
  getStationDetail(id: number | string) {
    return useApi()
      .get<ApiResponseWrapper<ChargingStationSummary>>(`/ev-charger/stations/${id}`)
      .then((r) => r.data);
  },

  /**
   * Current user's in-progress charging session, if any.
   * GET /ev-charger/sessions/active
   */
  getActiveSession() {
    return useApi()
      .get<ApiResponseWrapper<ChargingSession | null>>("/ev-charger/sessions/active")
      .then((r) => r.data);
  },

  /**
   * GET /ev-charger/sessions/{id}
   */
  getSession(sessionId: number | string) {
    return useApi()
      .get<ApiResponseWrapper<ChargingSession>>(`/ev-charger/sessions/${sessionId}`)
      .then((r) => r.data);
  },

  /**
   * GET /ev-charger/sessions
   */
  getSessionHistory(params?: SessionHistoryParams) {
    return useApi()
      .get<ApiResponseWrapper<ChargingSession[]>>("/ev-charger/sessions", {
        params: cleanParams(params),
      })
      .then((r) => r.data);
  },

  /**
   * POST /ev-charger/sessions/start
   */
  startCharging(payload: StartChargingPayload) {
    return useApi()
      .post<ApiResponseWrapper<ChargingSession>>("/ev-charger/sessions/start", payload)
      .then((r) => r.data);
  },

  /**
   * POST /ev-charger/sessions/{id}/stop
   */
  stopCharging(sessionId: number | string) {
    return useApi()
      .post<ApiResponseWrapper<ChargingSession>>(`/ev-charger/sessions/${sessionId}/stop`, {})
      .then((r) => r.data);
  },
};
