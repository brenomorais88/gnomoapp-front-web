import { describe, expect, it } from "vitest";
import { appNavigationItems, financeNavigationItems, getRouteLabelKey } from "./navigation";

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

  it("keeps financial dashboard as first finance item", () => {
    expect(financeNavigationItems[0]?.href).toBe("/financial-dashboard");
    expect(financeNavigationItems[0]?.labelKey).toBe("navigation.financeDashboard");
  });
});
