import { FinancialDashboardOccurrenceViewModel } from "@/features/dashboard/types";
import { getDateKeyInTimezone } from "@/features/dashboard/parsers";

export function selectOccurrencesForDay(
  occurrences: FinancialDashboardOccurrenceViewModel[],
  selectedDate: Date,
  timezone: string,
) {
  const selectedDayKey = getDateKeyInTimezone(selectedDate, timezone);
  return occurrences
    .filter((item) => item.dueDateKey === selectedDayKey)
    .sort((a, b) => a.dueDateKey.localeCompare(b.dueDateKey));
}
