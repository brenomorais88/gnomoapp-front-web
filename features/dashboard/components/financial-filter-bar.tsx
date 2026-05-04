"use client";

import type { AccountDto } from "@/features/accounts/types";
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
  accountId: string;
  onAccountChange: (accountId: string) => void;
  accounts: AccountDto[];
  month: string;
  onMonthChange: (month: string) => void;
  statusSegment: FinanceStatusSegment;
  onStatusSegmentChange: (segment: FinanceStatusSegment) => void;
};

export function FinancialFilterBar({
  scope,
  onScopeChange,
  accountId,
  onAccountChange,
  accounts,
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

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-muted/30 p-4 shadow-sm sm:p-5 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-8">
      <fieldset className="min-w-0 space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("financeDashboard.filters.scope")}
        </legend>
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border/80 bg-background p-1 shadow-inner">
          {SCOPES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onScopeChange(value)}
              className={cn(
                "ds-focus-ring rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm",
                scope === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-pressed={scope === value}
            >
              {t(scopeLabelKey[value])}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid w-full gap-4 sm:grid-cols-2 lg:flex lg:w-auto lg:min-w-0 lg:flex-1 lg:items-end lg:justify-end lg:gap-4">
        <div className="space-y-1.5 sm:min-w-[200px]">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="financial-filter-account"
          >
            {t("financeDashboard.filters.account")}
          </label>
          <select
            id="financial-filter-account"
            value={accountId}
            onChange={(e) => onAccountChange(e.target.value)}
            className="ds-focus-ring h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm"
          >
            <option value="">{t("financeDashboard.filters.allAccounts")}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:min-w-[200px]">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="financial-filter-month"
          >
            {t("financeDashboard.filters.month")}
          </label>
          <input
            id="financial-filter-month"
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="ds-focus-ring h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm"
          />
        </div>
      </div>

      <fieldset className="w-full min-w-0 space-y-2 lg:max-w-xl">
        <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("financeDashboard.filters.status")}
        </legend>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("financeDashboard.filters.status")}
        >
          {statusOptions.map((opt) => {
            const active = statusSegment === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusSegmentChange(opt.id)}
                className={cn(
                  "ds-focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm",
                  active
                    ? "border-primary bg-primary/12 text-primary shadow-sm"
                    : "border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground",
                )}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
