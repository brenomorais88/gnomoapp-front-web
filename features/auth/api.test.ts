import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMe, login, register } from "./api";

describe("auth api", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8081";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("registers and parses access token plus user", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            accessToken: "token-register",
            user: { id: "u1", firstName: "Ana", lastName: "Silva", email: "ana@email.com" },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await register({
      firstName: "Ana",
      lastName: "Silva",
      document: "12345678900",
      birthDate: "1990-01-10",
      password: "123456",
      email: "ana@email.com",
      phone: "11999999999",
    });

    expect(result.accessToken).toBe("token-register");
    expect(result.user).toMatchObject({
      id: "u1",
      name: "Ana Silva",
      email: "ana@email.com",
    });
    const [, options] = fetchMock.mock.calls[0];
    expect((options as RequestInit).body).toContain("\"birthDate\":\"1990-01-10\"");
  });

  it("logs in and supports wrapped payload with data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              accessToken: "token-login",
              user: { id: "u2", name: "Joao", email: "joao@email.com" },
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await login({
      login: "joao@email.com",
      password: "123456",
    });

    expect(result.accessToken).toBe("token-login");
    expect(result.user.id).toBe("u2");
  });

  it("hydrates current user from /auth/me", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "u3",
            name: "Maria",
            email: "maria@email.com",
            permissions: ["dashboard:view"],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await getMe();

    expect(result).toMatchObject({
      id: "u3",
      name: "Maria",
      email: "maria@email.com",
      permissions: ["dashboard:view"],
    });
  });
});
