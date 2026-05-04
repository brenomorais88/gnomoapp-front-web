"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardActionCardTone = "danger" | "info" | "success" | "warning";

const toneBorder: Record<DashboardActionCardTone, string> = {
  danger: "border-destructive/25 hover:border-destructive/40",
  info: "border-primary/20 hover:border-primary/35",
  success: "border-success/25 hover:border-success/40",
  warning: "border-amber-400/35 hover:border-amber-500/50",
};

const toneIconBg: Record<DashboardActionCardTone, string> = {
  danger: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
};

type DashboardActionCardProps = {
  tone: DashboardActionCardTone;
  title: string;
  icon: LucideIcon;
  primaryLine: string;
  secondaryLine?: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function DashboardActionCard({
  tone,
  title,
  icon: Icon,
  primaryLine,
  secondaryLine,
  actionLabel,
  onAction,
  disabled,
  loading,
}: DashboardActionCardProps) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg",
        toneBorder[tone],
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4 pb-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            toneIconBg[tone],
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
            {loading ? "…" : primaryLine}
          </p>
          {secondaryLine ? (
            <p className="text-sm text-muted-foreground">{loading ? "…" : secondaryLine}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardFooter className="mt-auto p-4 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full transition-all"
          onClick={onAction}
          disabled={disabled || loading}
        >
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
