import { describe, expect, it } from "vitest";
import { resolveSessionFlow } from "./session-flow";

describe("resolveSessionFlow", () => {
  it("redirects unauthenticated private requests to login", () => {
    const result = resolveSessionFlow("private", {
      isAuthLoading: false,
      isAuthenticated: false,
      isFamilyLoading: false,
      familyStatus: "idle",
    });

    expect(result).toEqual({ type: "redirect", to: "/auth/login" });
  });

  it("redirects authenticated users without family to onboarding", () => {
    const result = resolveSessionFlow("private", {
      isAuthLoading: false,
      isAuthenticated: true,
      isFamilyLoading: false,
      familyStatus: "no-family",
    });

    expect(result).toEqual({ type: "redirect", to: "/onboarding/family" });
  });

  it("allows onboarding mode when user has no family", () => {
    const result = resolveSessionFlow("onboarding", {
      isAuthLoading: false,
      isAuthenticated: true,
      isFamilyLoading: false,
      familyStatus: "no-family",
    });

    expect(result).toEqual({ type: "allow" });
  });

  it("redirects guest mode with family to main area", () => {
    const result = resolveSessionFlow("guest", {
      isAuthLoading: false,
      isAuthenticated: true,
      isFamilyLoading: false,
      familyStatus: "ready",
    });

    expect(result).toEqual({ type: "redirect", to: "/" });
  });
});
