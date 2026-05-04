import { FinancialDashboardOccurrenceViewModel } from "@/features/dashboard/types";

export type CategoryPieDatum = {
  categoryId: string;
  name: string;
  total: number;
  percentage: number;
  color: string;
};

export function aggregateCategoryPieData(
  occurrences: FinancialDashboardOccurrenceViewModel[],
  resolveCategoryName: (categoryId: string) => string,
  fallbackCategoryName: string,
  colors: string[],
): CategoryPieDatum[] {
  const grouped = new Map<string, { name: string; total: number }>();

  for (const item of occurrences) {
    const categoryId = item.categoryId ?? "uncategorized";
    const resolvedName = resolveCategoryName(categoryId).trim();
    const name = resolvedName || fallbackCategoryName;
    const previous = grouped.get(categoryId);

    if (previous) {
      previous.total += item.amount;
      continue;
    }

    grouped.set(categoryId, { name, total: item.amount });
  }

  const totalAmount = Array.from(grouped.values()).reduce((sum, item) => sum + item.total, 0);

  return Array.from(grouped.entries())
    .map(([categoryId, entry], index) => ({
      categoryId,
      name: entry.name,
      total: entry.total,
      percentage: totalAmount > 0 ? (entry.total / totalAmount) * 100 : 0,
      color: colors[index % colors.length] ?? "#64748B",
    }))
    .sort((a, b) => b.total - a.total);
}
