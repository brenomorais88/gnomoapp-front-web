import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, setApiAccessTokenResolver } from "./client";
import { subscribeToApiClientEvents } from "./events";
import { ApiError } from "./error";

describe("apiRequest", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8081";
  });

  afterEach(() => {
    setApiAccessTokenResolver(null);
    vi.unstubAllGlobals();
  });

  it("adds authorization header when token resolver is configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    setApiAccessTokenResolver(() => "token-123");

    await apiRequest("/health");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0];
    const requestHeaders = new Headers((options as RequestInit).headers);
    expect(requestHeaders.get("Authorization")).toBe("Bearer token-123");
  });

  it("emits unauthorized event on 401 responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthorized", code: "AUTH_401" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const listener = vi.fn();
    const unsubscribe = subscribeToApiClientEvents(listener);

    await expect(apiRequest("/protected")).rejects.toBeInstanceOf(ApiError);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: "unauthorized" }),
    );

    unsubscribe();
  });
});
