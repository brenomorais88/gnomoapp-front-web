import { describe, expect, it } from "vitest";
import { aggregateCategoryPieData } from "./category-aggregations";
import { FinancialDashboardOccurrenceViewModel } from "./types";

describe("category pie aggregations", () => {
  it("groups by category and calculates percentages", () => {
    const occurrences: FinancialDashboardOccurrenceViewModel[] = [
      {
        id: "o1",
        titleSnapshot: "Conta 1",
        description: "Conta 1",
        amount: 100,
        dueDate: new Date("2026-05-10T12:00:00"),
        dueDateKey: "2026-05-10",
        status: "pending",
        categoryId: "cat-1",
      },
      {
        id: "o2",
        titleSnapshot: "Conta 2",
        description: "Conta 2",
        amount: 300,
        dueDate: new Date("2026-05-12T12:00:00"),
        dueDateKey: "2026-05-12",
        status: "paid",
        categoryId: "cat-2",
      },
    ];

    const result = aggregateCategoryPieData(
      occurrences,
      (id) => (id === "cat-1" ? "Moradia" : "Lazer"),
      "Sem categoria",
      ["#111111", "#222222"],
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      categoryId: "cat-2",
      total: 300,
      percentage: 75,
    });
    expect(result[1]).toMatchObject({
      categoryId: "cat-1",
      total: 100,
      percentage: 25,
    });
    expect(result.map((item) => item.color)).toEqual(["#222222", "#111111"]);
  });

  it("applies friendly fallback for missing category names", () => {
    const occurrences: FinancialDashboardOccurrenceViewModel[] = [
      {
        id: "o1",
        titleSnapshot: "Conta sem categoria",
        description: "Conta sem categoria",
        amount: 50,
        dueDate: new Date("2026-05-10T12:00:00"),
        dueDateKey: "2026-05-10",
        status: "pending",
      },
    ];

    const result = aggregateCategoryPieData(occurrences, () => "", "Sem categoria definida", ["#111111"]);
    expect(result[0]).toMatchObject({
      categoryId: "uncategorized",
      name: "Sem categoria definida",
      total: 50,
      percentage: 100,
    });
  });
});
