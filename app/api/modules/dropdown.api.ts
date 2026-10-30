import type { AxiosInstance } from "axios";
import type { ApiResponseWrapper, DropdownParams, NewFeedData } from "../types";

export const dropdownApi = (http: AxiosInstance) => ({
  // post /dropdown/new-feed/list
  getNewFeedDropdown: (params?: DropdownParams) =>
    http
      .post<ApiResponseWrapper<NewFeedData[]>>("/dropdown/new-feed/list", params)
      .then((r) => r.data),
});

export const getDropdownApi = dropdownApi;
