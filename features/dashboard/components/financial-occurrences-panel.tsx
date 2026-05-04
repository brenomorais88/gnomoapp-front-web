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
  payMode: boolean;
  paymentMutationBusy: boolean;
  activePaymentItemId: string | null;
  flashSuccessId: string | null;
  onPayment: (item: FinancialDashboardOccurrenceViewModel) => void;
};

export function FinancialOccurrencesPanel({
  items,
  timezone,
  getCategoryLabel,
  payMode,
  paymentMutationBusy,
  activePaymentItemId,
  flashSuccessId,
  onPayment,
}: FinancialOccurrencesPanelProps) {
  const todayKey = getDateKeyInTimezone(new Date(), timezone);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const paymentLabel =
          item.paidAt && Number.isFinite(item.paidAt.getTime())
            ? new Intl.DateTimeFormat("pt-BR", {
                timeZone: timezone,
                dateStyle: "short",
                timeStyle: "short",
              }).format(item.paidAt)
            : null;
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
        const categoryOnly = getCategoryLabel(item.categoryId);

        return (
          <div
            key={item.id}
            className={cn(
              "grid gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md md:grid-cols-12 md:items-center md:gap-4 md:py-5",
              overdueRow
                ? "border-destructive/30 bg-destructive/[0.08]"
                : "border-border/40 hover:bg-muted/30",
              flashSuccessId === item.id && "finance-row-flash ring-2 ring-success/40",
            )}
          >
            <div className="md:col-span-4">
              <p className="font-bold leading-snug text-foreground">{item.description}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{categoryOnly}</p>
            </div>

            <div className="md:col-span-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("financeDashboard.monthOccurrencesList.dueDate")}
              </p>
              <p className="text-sm font-semibold text-foreground">{dueLabel}</p>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("financeDashboard.monthOccurrencesList.paymentDate")}
              </p>
              <p className="text-sm text-muted-foreground">
                {paymentLabel ?? t("financeDashboard.monthOccurrencesList.noPaymentYet")}
              </p>
            </div>

            <div className="flex items-baseline justify-between gap-3 md:col-span-2 md:flex-col md:items-end md:justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground md:hidden">
                {t("occurrences.table.amount")}
              </p>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums tracking-tight text-foreground md:text-right",
                  payMode && "text-2xl",
                )}
              >
                {formatCurrencyBRL(item.amount)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:col-span-1 md:justify-center">
              <FinanceOccurrenceBadge status={item.status as OccurrenceStatus} />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 md:items-end">
              {showPaymentActions ? (
                item.status === "pending" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size={payMode ? "default" : "sm"}
                    className={cn(
                      "w-full gap-2 md:w-auto md:min-w-[9rem] font-semibold transition-all",
                      payMode && "min-h-11 text-base",
                    )}
                    disabled={paymentMutationBusy}
                    onClick={() => onPayment(item)}
                  >
                    <CheckCircle2 className="size-4" />
                    {isUpdatingThisRow
                      ? t("financeDashboard.dailyList.updatingStatus")
                      : t("financeDashboard.dailyList.markAsPaid")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size={payMode ? "default" : "sm"}
                    className={cn("w-full gap-2 md:w-auto font-semibold transition-all", payMode && "min-h-11")}
                    disabled={paymentMutationBusy}
                    onClick={() => onPayment(item)}
                  >
                    <RefreshCw className="size-4" />
                    {isUpdatingThisRow
                      ? t("financeDashboard.dailyList.updatingStatus")
                      : t("financeDashboard.dailyList.unmarkPaid")}
                  </Button>
                )
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
