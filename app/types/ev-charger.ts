/**
 * EV Charger domain types.
 *
 * Endpoint shapes here are best-guess placeholders based on the existing
 * `ev_charger/index.vue` mock UI ("Your vehicle is charging" / "View Detail").
 * Confirm field names against the real backend contract before shipping —
 * search-and-replace is cheap, this is just so the query layer has something
 * concrete to type against.
 */

export interface ChargingStationSummary {
  id: number | string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: "available" | "in_use" | "offline" | string;
  connectorType?: string;
  powerKw?: number;
  distanceKm?: number;
  [key: string]: any;
}

export interface ChargingStationListParams {
  page?: number;
  size?: number;
  keyword?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  [key: string]: any;
}

export interface ChargingSession {
  id: number | string;
  stationId: number | string;
  stationName?: string;
  vehiclePlateNumber?: string;
  status: "charging" | "completed" | "stopped" | "error" | string;
  startedAt?: string;
  stoppedAt?: string;
  energyKwh?: number;
  costAmount?: number | string;
  currency?: string;
  batteryPercent?: number;
  estimatedFullAt?: string;
  [key: string]: any;
}

export interface StartChargingPayload {
  stationId: number | string;
  connectorId?: number | string;
  vehicleId?: number | string;
}

export interface SessionHistoryParams {
  page?: number;
  size?: number;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}
