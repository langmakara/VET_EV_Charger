import type { AxiosInstance } from "axios";
import type { ApiResponseWrapper, DropdownParams, GunTypeData, NewFeedData } from "../types";

export const dropdownApi = (http: AxiosInstance) => ({
  // post /dropdown/new-feed/list
  getNewFeedDropdown: (params?: DropdownParams) =>
    http
      .post<ApiResponseWrapper<NewFeedData[]>>("/dropdown/new-feed/list", params)
      .then((r) => r.data),

  // get /dropdown/gun/list
  getGunTypeDropdown: (params?: DropdownParams) =>
    http
      .post<ApiResponseWrapper<GunTypeData[]>>("/dropdown/gun/list", params)
      .then((r) => r.data),
});

export const getDropdownApi = dropdownApi;
