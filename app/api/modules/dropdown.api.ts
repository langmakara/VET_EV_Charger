import type { AxiosInstance } from "axios";
import type {
  ApiResponseWrapper,
  ContactUsDropdownData,
  DropdownParams,
  FaqsDropdownData,
  GunTypeData,
  NewFeedData,
  PrivacyPolicyDropdownData
} from "../types";

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

  // post /dropdown/privacy-policy/list
  getPrivacyPolicyDropdown: (params?: DropdownParams) =>
    http
      .post<ApiResponseWrapper<PrivacyPolicyDropdownData[]>>("/dropdown/privacy-policy/list", params)
      .then((r) => r.data),

  // post /dropdown/faqs/list
  getFaqsDropdown: (params?: DropdownParams) =>
    http
      .post<ApiResponseWrapper<FaqsDropdownData[]>>("/dropdown/faqs/list", params)
      .then((r) => r.data),

  // post /dropdown/contact-us/list
  getContactUsDropdown: (params?: DropdownParams) =>
    http
      .post<ApiResponseWrapper<ContactUsDropdownData[]>>("/dropdown/contact-us/list", params)
      .then((r) => r.data),
});

export const getDropdownApi = dropdownApi;
