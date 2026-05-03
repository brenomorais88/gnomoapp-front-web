import { describe, expect, it } from "vitest";
import {
  canExecuteAction,
  getCurrentUserFamilyRole,
  hasFamily,
  isFamilyAdmin,
} from "./helpers";

describe("authorization helpers", () => {
  it("detects family presence from status", () => {
    expect(hasFamily("ready")).toBe(true);
    expect(hasFamily("no-family")).toBe(false);
  });

  it("detects admin role", () => {
    expect(isFamilyAdmin("ADMIN")).toBe(true);
    expect(isFamilyAdmin("MEMBER")).toBe(false);
  });

  it("resolves current user role from member list", () => {
    const role = getCurrentUserFamilyRole(
      [
        { id: "u1", name: "Ana", role: "ADMIN", status: "ACTIVE" },
        { id: "u2", name: "Joao", role: "MEMBER", status: "ACTIVE" },
      ],
      "u2",
    );

    expect(role).toBe("MEMBER");
  });

  it("resolves current user role by email fallback", () => {
    const role = getCurrentUserFamilyRole(
      [
        {
          id: "family-member-1",
          name: "Breno",
          email: "breno@daily.local",
          role: "ADMIN",
          status: "ACTIVE",
        },
      ],
      "user-id-different",
      "breno@daily.local",
    );

    expect(role).toBe("ADMIN");
  });

  it("allows action when matching permission exists", () => {
    const result = canExecuteAction("manageCategories", ["canManageCategories"]);
    expect(result).toBe(true);
  });

  it("allows any action for family admin", () => {
    const result = canExecuteAction("deleteFamilyAccount", [], { isFamilyAdmin: true });
    expect(result).toBe(true);
  });
});
