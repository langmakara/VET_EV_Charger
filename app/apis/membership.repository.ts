import { useApi } from "./HttpFactory";
import type { ApiResponseWrapper, MembershipBenefit } from "~/types";

export const membershipRepository = {
  getMembershipBenefits() {
    return useApi()
      .post<ApiResponseWrapper<MembershipBenefit[]>>("/membership/level/list")
      .then((r) => r.data);
  },
};
