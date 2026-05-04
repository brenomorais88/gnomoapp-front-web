import { getDateKeyInTimezone } from "@/features/dashboard/parsers";
import type { FinancialDashboardOccurrenceViewModel } from "@/features/dashboard/types";

/** KPIs derivados apenas dos dados já carregados (sem chamadas extras à API). */
export function deriveFinancialKpis(
  occurrences: FinancialDashboardOccurrenceViewModel[],
  timezone: string,
) {
  const todayKey = getDateKeyInTimezone(new Date(), timezone);
  const weekEndDate = new Date();
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEndKey = getDateKeyInTimezone(weekEndDate, timezone);

  let pendingTotal = 0;
  let paidTotal = 0;
  let upcoming7Count = 0;

  for (const o of occurrences) {
    if (o.status === "pending") {
      pendingTotal += o.amount;
      if (o.dueDateKey >= todayKey && o.dueDateKey <= weekEndKey) {
        upcoming7Count += 1;
      }
    }
    if (o.status === "paid") {
      paidTotal += o.amount;
    }
  }

  return { pendingTotal, paidTotal, upcoming7Count };
}

export function isPendingOverdue(
  item: FinancialDashboardOccurrenceViewModel,
  todayKey: string,
): boolean {
  return item.status === "pending" && item.dueDateKey < todayKey;
}
