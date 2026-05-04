"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryPieDatum } from "@/features/dashboard/category-aggregations";
import { formatCurrencyBRL } from "@/features/dashboard/monthly-aggregations";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { t } from "@/lib/i18n";

type FinancialDistributionSectionProps = {
  pieData: CategoryPieDatum[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function FinancialDistributionSection({
  pieData,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: FinancialDistributionSectionProps) {
  const top = pieData.slice(0, 6);

  return (
    <Card className="overflow-hidden rounded-xl border-border/40 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="border-b border-border/30 pb-4">
        <p className="text-base font-bold text-foreground">{t("financeDashboard.pie.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("financeDashboard.pie.description")}</p>
      </CardHeader>
      <CardContent className="space-y-5 p-5 sm:p-6">
        {isLoading ? (
          <LoadingState label={t("states.loading")} className="min-h-40 py-6" />
        ) : isError ? (
          <ErrorState
            title={t("financeDashboard.loadErrorTitle")}
            description={errorMessage}
            action={
              <Button variant="outline" size="sm" onClick={onRetry}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : pieData.length === 0 ? (
          <EmptyState
            title={t("financeDashboard.noPieData")}
            description={t("financeDashboard.noPieDataDescription")}
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <>
            <div className="mx-auto h-48 w-full max-w-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="total"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={76}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, payload) => {
                      const percent = Number(
                        (payload?.payload as { percentage?: number } | undefined)?.percentage ?? 0,
                      );
                      return `${formatCurrencyBRL(Number(value ?? 0))} (${percent.toFixed(1)}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("financeDashboard.distribution.topCategories")}
              </p>
              <ul className="space-y-2.5">
                {top.map((entry) => (
                  <li
                    key={entry.categoryId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium text-foreground">{entry.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground font-medium">
                      {formatCurrencyBRL(entry.total)}{" "}
                      <span className="text-xs font-normal">({entry.percentage.toFixed(0)}%)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
