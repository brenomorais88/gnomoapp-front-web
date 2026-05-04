import { describe, expect, it, vi } from "vitest";
import { calculateMonthlyCardsSummary, MONTHLY_FORECAST_VALUE } from "./monthly-aggregations";
import { FinancialDashboardOccurrenceViewModel } from "./types";

describe("monthly dashboard aggregations", () => {
  it("computes overdue and month totals with fixed forecast", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00Z"));

    const occurrences: FinancialDashboardOccurrenceViewModel[] = [
      {
        id: "1",
        titleSnapshot: "Pending overdue",
        description: "Pending overdue",
        amount: 100,
        dueDate: new Date("2026-05-10T12:00:00"),
        dueDateKey: "2026-05-10",
        status: "pending",
      },
      {
        id: "2",
        titleSnapshot: "Pending future",
        description: "Pending future",
        amount: 200,
        dueDate: new Date("2026-05-25T12:00:00"),
        dueDateKey: "2026-05-25",
        status: "pending",
      },
      {
        id: "3",
        titleSnapshot: "Paid",
        description: "Paid",
        amount: 300,
        dueDate: new Date("2026-05-15T12:00:00"),
        dueDateKey: "2026-05-15",
        status: "paid",
      },
      {
        id: "4",
        titleSnapshot: "Cancelled",
        description: "Cancelled",
        amount: 400,
        dueDate: new Date("2026-05-18T12:00:00"),
        dueDateKey: "2026-05-18",
        status: "cancelled",
      },
    ];

    const result = calculateMonthlyCardsSummary(occurrences, "America/Sao_Paulo");

    expect(result.overdueCount).toBe(1);
    expect(result.overdueAmount).toBe(100);
    expect(result.monthTotalAmount).toBe(600);
    expect(result.forecastAmount).toBe(MONTHLY_FORECAST_VALUE);

    vi.useRealTimers();
  });

  it("returns zeroed values in empty state", () => {
    const result = calculateMonthlyCardsSummary([], "America/Sao_Paulo");
    expect(result).toEqual({
      overdueCount: 0,
      overdueAmount: 0,
      monthTotalAmount: 0,
      forecastAmount: MONTHLY_FORECAST_VALUE,
    });
  });
});
