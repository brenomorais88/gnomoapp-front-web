import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getFinancialDashboardData,
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

  it("loads financial dashboard data from occurrences with frontend fallback filters", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "o1",
                description: "Conta A",
                amountSnapshot: "120.40",
                dueDate: "2026-05-10T00:00:00Z",
                status: "PENDING",
                scope: "FAMILY",
                accountId: "acc-1",
              },
              {
                id: "o2",
                description: "Conta B",
                amount: "99.90",
                dueDate: "2026-05-20",
                status: "PAID",
                scope: "FAMILY",
                accountId: "acc-1",
              },
              {
                id: "o3",
                description: "Conta C",
                amount: "50",
                dueDate: "2026-06-02",
                status: "PENDING",
                scope: "FAMILY",
                accountId: "acc-1",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await getFinancialDashboardData({
      scope: "FAMILY",
      accountId: "acc-1",
      statuses: ["pending", "paid"],
      month: "2026-05",
      timezone: "America/Sao_Paulo",
    });

    expect(result.occurrences).toHaveLength(2);
    expect(result.occurrences[0]?.amount).toBe(120.4);
    expect(result.occurrences[0]?.dueDate).toBeInstanceOf(Date);
    expect(result.source.backendApplied).toEqual([
      "startDate",
      "endDate",
      "month",
      "scope",
    ]);
    expect(result.source.frontendApplied).toContain("status(client)");
  });

  it("propagates api errors from financial dashboard data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Internal Server Error" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      getFinancialDashboardData({
        scope: "VISIBLE_TO_ME",
        month: "2026-05",
      }),
    ).rejects.toMatchObject({ status: 500 });
  });
});
