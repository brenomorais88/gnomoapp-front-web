import { FinancialDashboardOccurrenceViewModel } from "@/features/dashboard/types";
import { getDateKeyInTimezone } from "@/features/dashboard/parsers";

const CURRENCY_BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const MONTHLY_FORECAST_VALUE = 7500;

export type MonthlyCardsSummary = {
  overdueCount: number;
  overdueAmount: number;
  monthTotalAmount: number;
  forecastAmount: number;
};

export function formatCurrencyBRL(value: number) {
  return CURRENCY_BRL.format(value);
}

export function calculateMonthlyCardsSummary(
  occurrences: FinancialDashboardOccurrenceViewModel[],
  timezone: string,
): MonthlyCardsSummary {
  const todayKey = getDateKeyInTimezone(new Date(), timezone);

  let overdueCount = 0;
  let overdueAmount = 0;
  let monthTotalAmount = 0;

  for (const item of occurrences) {
    const isPending = item.status === "pending";
    const isPaid = item.status === "paid";

    if (isPending && item.dueDateKey < todayKey) {
      overdueCount += 1;
      overdueAmount += item.amount;
    }

    if (isPending || isPaid) {
      monthTotalAmount += item.amount;
    }
  }

  return {
    overdueCount,
    overdueAmount,
    monthTotalAmount,
    forecastAmount: MONTHLY_FORECAST_VALUE,
  };
}
