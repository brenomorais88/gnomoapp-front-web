"use client";

import type { OccurrenceStatus } from "@/features/occurrences/types";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

const styles: Record<OccurrenceStatus, string> = {
  pending: "border-primary/40 bg-primary/12 text-primary",
  paid: "border-success/40 bg-success/12 text-success",
  overdue: "border-destructive/40 bg-destructive/12 text-destructive",
  cancelled: "border-border bg-muted text-muted-foreground",
};

type FinanceOccurrenceBadgeProps = {
  status: OccurrenceStatus;
  className?: string;
};

export function FinanceOccurrenceBadge({ status, className }: FinanceOccurrenceBadgeProps) {
  return (
    <span className={cn(base, styles[status], className)}>
      {t(`occurrences.statusFilter.${status}`)}
    </span>
  );
}
