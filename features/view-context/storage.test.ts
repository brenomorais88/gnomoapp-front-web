import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_VIEW_SCOPE,
  VIEW_SCOPE_STORAGE_KEY,
  isValidViewScope,
  loadStoredViewScope,
  parseStoredViewScope,
  saveStoredViewScope,
} from "./storage";

describe("view scope storage", () => {
  it("validates allowed scopes", () => {
    expect(isValidViewScope("PERSONAL")).toBe(true);
    expect(isValidViewScope("FAMILY")).toBe(true);
    expect(isValidViewScope("VISIBLE_TO_ME")).toBe(true);
    expect(isValidViewScope("OTHER")).toBe(false);
  });

  it("falls back to default scope for invalid values", () => {
    expect(parseStoredViewScope("INVALID")).toBe(DEFAULT_VIEW_SCOPE);
    expect(parseStoredViewScope(null)).toBe(DEFAULT_VIEW_SCOPE);
  });

  it("loads and saves current scope from storage", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue("FAMILY"),
      setItem: vi.fn(),
    } as unknown as Storage;

    expect(loadStoredViewScope(storage)).toBe("FAMILY");

    saveStoredViewScope(storage, "PERSONAL");
    expect(storage.setItem).toHaveBeenCalledWith(VIEW_SCOPE_STORAGE_KEY, "PERSONAL");
  });
});
