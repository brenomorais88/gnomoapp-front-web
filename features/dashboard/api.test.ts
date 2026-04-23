import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDashboardCategorySummary,
  getDashboardDay,
  getDashboardHome,
  getDashboardNext12Months,
} from "./api";

describe("dashboard api", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8081";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads dashboard home by month", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            overdue: [{ id: "o1", title: "Conta A", amount: "100", dueDate: "2026-04-10" }],
            next7Days: [{ id: "o2", title: "Conta B", amount: "50", dueDate: "2026-04-25" }],
            upcoming: [],
            totalPendingInMonth: "150",
            totalPaidInMonth: "20",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await getDashboardHome("2026-04");
    expect(result.overdue).toHaveLength(1);
    expect(result.totalPendingInMonth).toBe("150");
  });

  it("loads day payload and accepts occurrences alias", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            date: "2026-04-22",
            occurrences: [{ id: "o3", title: "Conta C", amount: "10", dueDate: "2026-04-22" }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await getDashboardDay("2026-04-22");
    expect(result.items).toHaveLength(1);
    expect(result.date).toBe("2026-04-22");
  });

  it("loads next 12 months data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            points: [{ month: "2026-05", totalAmount: "400", count: 2 }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await getDashboardNext12Months(true);
    expect(result.points).toHaveLength(1);
  });

  it("loads category summary by month", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            month: "2026-04",
            items: [{ categoryId: "c1", totalAmount: "80", count: 2 }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await getDashboardCategorySummary("2026-04");
    expect(result.items[0]).toMatchObject({ categoryId: "c1", count: 2 });
  });
});
