/**
 * User Repository
 *
 * Abstracts all user/auth-domain API endpoints into clean function calls.
 * Consume through `~/composables/useUserProfile.ts` (imperative, used in
 * route middleware) or `~/composables/queries/useUserQueries.ts` (reactive,
 * for components).
 */
import { useApi } from "./HttpFactory";
import type { ApiResponseWrapper, UserProfile } from "~/types";

export const userRepository = {
  /**
   * Fetch current user profile details (id, username, phone number, etc.)
   *
   * GET /users/me
   */
  getUserProfile() {
    return useApi()
      .get<ApiResponseWrapper<UserProfile>>("/users/me")
      .then((r) => r.data);
  },
};
