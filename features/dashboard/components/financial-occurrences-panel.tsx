"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinanceOccurrenceBadge } from "@/features/dashboard/components/finance-occurrence-badge";
import { isPendingOverdue } from "@/features/dashboard/lib/financial-kpis";
import { getDateKeyInTimezone } from "@/features/dashboard/parsers";
import { formatCurrencyBRL } from "@/features/dashboard/monthly-aggregations";
import type { FinancialDashboardOccurrenceViewModel } from "@/features/dashboard/types";
import { OccurrenceStatus } from "@/features/occurrences/types";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type FinancialOccurrencesPanelProps = {
  items: FinancialDashboardOccurrenceViewModel[];
  timezone: string;
  getCategoryLabel: (categoryId?: string) => string;
  paymentMutationBusy: boolean;
  activePaymentItemId: string | null;
  flashSuccessId: string | null;
  onPayment: (item: FinancialDashboardOccurrenceViewModel) => void;
};

export function FinancialOccurrencesPanel({
  items,
  timezone,
  getCategoryLabel,
  paymentMutationBusy,
  activePaymentItemId,
  flashSuccessId,
  onPayment,
}: FinancialOccurrencesPanelProps) {
  const todayKey = getDateKeyInTimezone(new Date(), timezone);

  return (
    <div className="overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/40 bg-muted/30">
            <th className="px-3 py-3 font-semibold text-muted-foreground sm:px-4">
              {t("financeDashboard.monthOccurrencesList.columns.titleSnapshot")}
            </th>
            <th className="whitespace-nowrap px-3 py-3 font-semibold text-muted-foreground sm:px-4">
              {t("financeDashboard.monthOccurrencesList.columns.dueDate")}
            </th>
            <th className="whitespace-nowrap px-3 py-3 font-semibold text-muted-foreground sm:px-4">
              {t("financeDashboard.monthOccurrencesList.columns.amount")}
            </th>
            <th className="px-3 py-3 font-semibold text-muted-foreground sm:px-4">
              {t("financeDashboard.monthOccurrencesList.columns.category")}
            </th>
            <th className="whitespace-nowrap px-3 py-3 font-semibold text-muted-foreground sm:px-4">
              {t("financeDashboard.monthOccurrencesList.columns.status")}
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-right font-semibold text-muted-foreground sm:px-4">
              {t("financeDashboard.monthOccurrencesList.columns.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const dueLabel = new Intl.DateTimeFormat("pt-BR", {
              timeZone: timezone,
              dateStyle: "short",
            }).format(item.dueDate);

            const overdueRow =
              item.status === "pending" && isPendingOverdue(item, todayKey);
            const showPaymentActions =
              item.status === "pending" || item.status === "paid";
            const isUpdatingThisRow =
              activePaymentItemId === item.id && paymentMutationBusy;

            return (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border/30 transition-colors last:border-b-0",
                  overdueRow ? "bg-destructive/[0.06]" : "bg-card hover:bg-muted/20",
                  flashSuccessId === item.id && "finance-row-flash bg-success/5",
                )}
              >
                <td className="max-w-[220px] px-3 py-3 align-middle font-medium text-foreground sm:max-w-xs sm:px-4">
                  <span className="line-clamp-2">{item.titleSnapshot}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 align-middle tabular-nums text-foreground sm:px-4">
                  {dueLabel}
                </td>
                <td className="whitespace-nowrap px-3 py-3 align-middle font-semibold tabular-nums text-foreground sm:px-4">
                  {formatCurrencyBRL(item.amount)}
                </td>
                <td className="max-w-[140px] px-3 py-3 align-middle text-muted-foreground sm:max-w-[180px] sm:px-4">
                  <span className="line-clamp-2">{getCategoryLabel(item.categoryId)}</span>
                </td>
                <td className="px-3 py-3 align-middle sm:px-4">
                  <FinanceOccurrenceBadge status={item.status as OccurrenceStatus} />
                </td>
                <td className="px-3 py-3 align-middle text-right sm:px-4">
                  {showPaymentActions ? (
                    item.status === "pending" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 font-semibold"
                        disabled={paymentMutationBusy}
                        onClick={() => onPayment(item)}
                      >
                        <CheckCircle2 className="size-4 shrink-0" />
                        {isUpdatingThisRow
                          ? t("financeDashboard.dailyList.updatingStatus")
                          : t("financeDashboard.dailyList.markAsPaid")}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 font-semibold"
                        disabled={paymentMutationBusy}
                        onClick={() => onPayment(item)}
                      >
                        <RefreshCw className="size-4 shrink-0" />
                        {isUpdatingThisRow
                          ? t("financeDashboard.dailyList.updatingStatus")
                          : t("financeDashboard.dailyList.unmarkPaid")}
                      </Button>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
