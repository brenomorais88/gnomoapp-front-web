import { describe, expect, it } from "vitest";
import { selectOccurrencesForDay } from "./daily-list";
import { FinancialDashboardOccurrenceViewModel } from "./types";

describe("daily list selector", () => {
  it("returns only occurrences from selected day", () => {
    const occurrences: FinancialDashboardOccurrenceViewModel[] = [
      {
        id: "o1",
        titleSnapshot: "Conta 1",
        description: "Conta 1",
        amount: 10,
        dueDate: new Date("2026-05-10T12:00:00"),
        dueDateKey: "2026-05-10",
        status: "pending",
      },
      {
        id: "o2",
        titleSnapshot: "Conta 2",
        description: "Conta 2",
        amount: 20,
        dueDate: new Date("2026-05-11T12:00:00"),
        dueDateKey: "2026-05-11",
        status: "paid",
      },
    ];

    const result = selectOccurrencesForDay(
      occurrences,
      new Date("2026-05-10T08:00:00"),
      "America/Sao_Paulo",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("o1");
  });

  it("returns empty list when no occurrences exist on selected day", () => {
    const result = selectOccurrencesForDay([], new Date("2026-05-10T08:00:00"), "America/Sao_Paulo");
    expect(result).toEqual([]);
  });
});
