import { ApiError } from "@/lib/api/error";

export const NO_FAMILY_FOR_USER_ERROR_CODE = "NO_FAMILY_FOR_USER";

export function isNoFamilyForUserError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.code === NO_FAMILY_FOR_USER_ERROR_CODE || error.status === 404)
  );
}
