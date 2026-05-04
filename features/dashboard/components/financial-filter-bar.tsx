"use client";

import type { ViewScope } from "@/features/view-context/types";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

export type FinanceStatusSegment = "all" | "pending" | "paid" | "overdue";

const SCOPES: ViewScope[] = ["VISIBLE_TO_ME", "PERSONAL", "FAMILY"];

const scopeLabelKey: Record<ViewScope, string> = {
  VISIBLE_TO_ME: "viewScope.short.VISIBLE_TO_ME",
  PERSONAL: "viewScope.short.PERSONAL",
  FAMILY: "viewScope.short.FAMILY",
};

type FinancialFilterBarProps = {
  scope: ViewScope;
  onScopeChange: (scope: ViewScope) => void;
  month: string;
  onMonthChange: (month: string) => void;
  statusSegment: FinanceStatusSegment;
  onStatusSegmentChange: (segment: FinanceStatusSegment) => void;
};

export function FinancialFilterBar({
  scope,
  onScopeChange,
  month,
  onMonthChange,
  statusSegment,
  onStatusSegmentChange,
}: FinancialFilterBarProps) {
  const statusOptions: { id: FinanceStatusSegment; label: string }[] = [
    { id: "all", label: t("financeDashboard.statusQuick.all") },
    { id: "pending", label: t("financeDashboard.statusQuick.pending") },
    { id: "paid", label: t("financeDashboard.statusQuick.paid") },
    { id: "overdue", label: t("financeDashboard.statusQuick.overdue") },
  ];

  const filterLabelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 shadow-sm">
      <div
        className={cn(
          "flex flex-col gap-4",
          "md:flex-row md:flex-wrap md:items-end md:gap-x-6 md:gap-y-3 lg:gap-x-8",
        )}
      >
        <div className="shrink-0">
          <span className={filterLabelClass}>{t("financeDashboard.filters.scope")}</span>
          <div
            className="inline-flex w-fit max-w-full flex-wrap gap-0.5 rounded-md border border-border/60 bg-muted/30 p-0.5"
            role="group"
            aria-label={t("financeDashboard.filters.scope")}
          >
            {SCOPES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onScopeChange(value)}
                className={cn(
                  "ds-focus-ring whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 sm:text-sm",
                  scope === value
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                )}
                aria-pressed={scope === value}
              >
                {t(scopeLabelKey[value])}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full shrink-0 sm:w-auto">
          <label className={filterLabelClass} htmlFor="financial-filter-month">
            {t("financeDashboard.filters.month")}
          </label>
          <input
            id="financial-filter-month"
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="ds-focus-ring box-border h-9 w-full min-w-0 rounded-md border border-border/50 bg-background px-2.5 text-sm font-medium text-foreground shadow-sm sm:w-[11.5rem]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className={filterLabelClass} id="financial-filter-status-label">
            {t("financeDashboard.filters.status")}
          </span>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-labelledby="financial-filter-status-label"
          >
            {statusOptions.map((opt) => {
              const active = statusSegment === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStatusSegmentChange(opt.id)}
                  className={cn(
                    "ds-focus-ring whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-transparent bg-muted/40 text-muted-foreground hover:border-border/60 hover:bg-muted/60 hover:text-foreground",
                  )}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
