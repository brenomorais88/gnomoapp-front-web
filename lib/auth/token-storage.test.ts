import { describe, expect, it, vi } from "vitest";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "./token-storage";

describe("token storage", () => {
  it("stores and reads token from memory first", () => {
    setStoredAccessToken("token-memory");
    expect(getStoredAccessToken()).toBe("token-memory");
    clearStoredAccessToken();
  });

  it("syncs with localStorage when available", () => {
    const setItem = vi.fn();
    const removeItem = vi.fn();
    const getItem = vi.fn().mockReturnValue("token-from-storage");

    vi.stubGlobal("window", {
      localStorage: { setItem, removeItem, getItem },
    });

    clearStoredAccessToken();
    expect(getStoredAccessToken()).toBe("token-from-storage");

    setStoredAccessToken("token-new");
    expect(setItem).toHaveBeenCalled();

    clearStoredAccessToken();
    expect(removeItem).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
