import { describe, expect, it } from "vitest";
import { loginFormSchema, registerFormSchema } from "./schema";

describe("auth schema", () => {
  it("validates login form", () => {
    const result = loginFormSchema.safeParse({
      login: "11999998888",
      password: "123456",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid register birthDate", () => {
    const result = registerFormSchema.safeParse({
      firstName: "Ana",
      lastName: "Silva",
      document: "12345678900",
      birthDate: "10/01/1990",
      password: "123456",
    });

    expect(result.success).toBe(false);
  });

  it("accepts register form with optional fields", () => {
    const result = registerFormSchema.safeParse({
      firstName: "Ana",
      lastName: "Silva",
      document: "12345678900",
      birthDate: "1990-01-10",
      password: "123456",
      phone: "",
      email: "",
    });

    expect(result.success).toBe(true);
  });
});
