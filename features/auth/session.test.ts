import { describe, expect, it } from "vitest";
import { buildAuthSession, withActiveFamilyId } from "./session";

describe("auth session helpers", () => {
  it("builds session with permission fallback", () => {
    const session = buildAuthSession({
      id: "u1",
      name: "Ana",
      email: "ana@email.com",
    });

    expect(session).toEqual({
      user: {
        id: "u1",
        name: "Ana",
        email: "ana@email.com",
      },
      permissions: [],
    });
  });

  it("updates active family in an existing session", () => {
    const session = withActiveFamilyId(
      {
        user: { id: "u2", name: "Bruno", email: "bruno@email.com", permissions: [] },
        permissions: [],
      },
      "f1",
    );

    expect(session?.activeFamilyId).toBe("f1");
  });

  it("keeps null session untouched", () => {
    expect(withActiveFamilyId(null, "f1")).toBeNull();
  });
});
