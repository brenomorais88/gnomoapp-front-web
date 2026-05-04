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
    <div className="flex flex-col gap-5 rounded-lg border border-border/40 bg-muted/20 p-5 shadow-sm sm:p-6 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-6">
      <fieldset className="min-w-0 space-y-2">
        <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("financeDashboard.filters.scope")}
        </legend>
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border/60 bg-background p-1.5 shadow-sm">
          {SCOPES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onScopeChange(value)}
              className={cn(
                "ds-focus-ring rounded-md px-3 py-2 text-xs font-bold transition-all sm:text-sm",
                scope === value
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
              aria-pressed={scope === value}
            >
              {t(scopeLabelKey[value])}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid w-full gap-4 sm:grid-cols-2 lg:flex lg:w-auto lg:min-w-0 lg:flex-1 lg:items-end lg:justify-end lg:gap-4">
        <div className="space-y-2 sm:min-w-[200px]">
          <label
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            htmlFor="financial-filter-account"
          >
            {t("financeDashboard.filters.account")}
          </label>
          <select
            id="financial-filter-account"
            value={accountId}
            onChange={(e) => onAccountChange(e.target.value)}
            className="ds-focus-ring h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-border/70"
          >
            <option value="">{t("financeDashboard.filters.allAccounts")}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:min-w-[200px]">
          <label
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            htmlFor="financial-filter-month"
          >
            {t("financeDashboard.filters.month")}
          </label>
          <input
            id="financial-filter-month"
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="ds-focus-ring h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-border/70"
          />
        </div>
      </div>

      <fieldset className="w-full min-w-0 space-y-2 lg:max-w-2xl">
        <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("financeDashboard.filters.status")}
        </legend>
        <div
          className="flex flex-wrap gap-2"
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
                  "ds-focus-ring rounded-full border px-4 py-2 text-xs font-bold transition-all sm:text-sm",
                  active
                    ? "border-primary bg-gradient-to-r from-primary/15 to-secondary/10 text-primary shadow-sm"
                    : "border-border/50 bg-background text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/30",
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
