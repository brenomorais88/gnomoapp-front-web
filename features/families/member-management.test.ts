import { describe, expect, it } from "vitest";
import { getNextFamilyMemberRole } from "./member-management";

describe("getNextFamilyMemberRole", () => {
  it("demotes admin to member", () => {
    expect(getNextFamilyMemberRole("ADMIN")).toBe("MEMBER");
  });

  it("promotes member to admin", () => {
    expect(getNextFamilyMemberRole("MEMBER")).toBe("ADMIN");
  });
});
