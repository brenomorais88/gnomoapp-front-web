import { describe, expect, it } from "vitest";
import { appNavigationItems, getRouteLabelKey } from "./navigation";

describe("navigation config", () => {
  it("contains only routes that exist in side menu definition", () => {
    expect(appNavigationItems.length).toBeGreaterThan(0);
    for (const item of appNavigationItems) {
      expect(item.href.startsWith("/")).toBe(true);
      expect(item.labelKey.startsWith("navigation.")).toBe(true);
    }
  });

  it("resolves profile route label", () => {
    expect(getRouteLabelKey("/profile")).toBe("navigation.profile");
  });
});
