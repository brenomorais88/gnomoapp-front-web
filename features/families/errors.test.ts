import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/error";
import { isNoFamilyForUserError } from "./errors";

describe("isNoFamilyForUserError", () => {
  it("returns true for explicit NO_FAMILY_FOR_USER code", () => {
    const error = new ApiError("No family", {
      status: 404,
      code: "NO_FAMILY_FOR_USER",
    });

    expect(isNoFamilyForUserError(error)).toBe(true);
  });

  it("returns false for non family errors", () => {
    const error = new ApiError("Forbidden", {
      status: 403,
      code: "FORBIDDEN",
    });

    expect(isNoFamilyForUserError(error)).toBe(false);
  });
});
