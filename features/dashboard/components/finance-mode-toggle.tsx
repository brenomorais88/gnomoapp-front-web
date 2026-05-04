"use client";

import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type FinanceModeToggleProps = {
  payMode: boolean;
  onPayModeChange: (payMode: boolean) => void;
};

export function FinanceModeToggle({ payMode, onPayModeChange }: FinanceModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1 shadow-inner"
      role="group"
      aria-label={t("financeDashboard.mode.overview")}
    >
      <button
        type="button"
        onClick={() => onPayModeChange(false)}
        className={cn(
          "ds-focus-ring rounded-lg px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
          !payMode
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={!payMode}
      >
        {t("financeDashboard.mode.overview")}
      </button>
      <button
        type="button"
        onClick={() => onPayModeChange(true)}
        className={cn(
          "ds-focus-ring rounded-lg px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
          payMode
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={payMode}
      >
        {t("financeDashboard.mode.payMode")}
      </button>
    </div>
  );
}
