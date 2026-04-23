import { describe, expect, it } from "vitest";
import { createFamilySchema, createPendingMemberSchema } from "./schema";

describe("createFamilySchema", () => {
  it("accepts valid name", () => {
    const result = createFamilySchema.safeParse({ name: "Familia Silva" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createFamilySchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts valid pending member payload", () => {
    const result = createPendingMemberSchema.safeParse({
      displayName: "Convidado",
      document: "",
      email: "convidado@email.com",
      phone: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid pending member email", () => {
    const result = createPendingMemberSchema.safeParse({
      displayName: "Convidado",
      email: "email-invalido",
    });

    expect(result.success).toBe(false);
  });
});
