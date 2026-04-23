import { describe, expect, it } from "vitest";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "./permissions";

describe("permissions helpers", () => {
  const granted = ["family:view", "occurrences:write", "dashboard:view"];

  it("checks a single permission", () => {
    expect(hasPermission(granted, "dashboard:view")).toBe(true);
    expect(hasPermission(granted, "dashboard:edit")).toBe(false);
  });

  it("checks any permission from a list", () => {
    expect(hasAnyPermission(granted, ["accounts:read", "dashboard:view"])).toBe(true);
    expect(hasAnyPermission(granted, ["accounts:read", "accounts:write"])).toBe(false);
  });

  it("checks all required permissions", () => {
    expect(hasAllPermissions(granted, ["family:view", "dashboard:view"])).toBe(true);
    expect(hasAllPermissions(granted, ["family:view", "users:manage"])).toBe(false);
  });
});
