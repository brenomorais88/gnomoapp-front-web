"use client";

import { useMemo, useState } from "react";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import { useOccurrencesListQuery } from "@/features/occurrences/hooks";
import { getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type MonthProjection = {
  key: string;
  label: string;
  total: number;
  count: number;
  items: {
    id: string;
    description: string;
    dueDate: string;
    amount: number;
    status?: string;
  }[];
};

export default function Next12MonthsPage() {
  const now = useMemo(() => new Date(), []);
  const rangeStart = useMemo(() => startOfMonth(now), [now]);
  const rangeEnd = useMemo(() => endOfMonth(addMonths(now, 11)), [now]);

  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const occurrencesQuery = useOccurrencesListQuery({
    fromDate: format(rangeStart, "yyyy-MM-dd"),
    toDate: format(rangeEnd, "yyyy-MM-dd"),
    size: 500,
  });

  const projectionMonths = useMemo<MonthProjection[]>(() => {
    const source = occurrencesQuery.data ?? [];

    const months: MonthProjection[] = Array.from({ length: 12 }).map((_, index) => {
      const monthDate = addMonths(rangeStart, index);

      return {
        key: format(monthDate, "yyyy-MM"),
        label: format(monthDate, "MMMM yyyy", { locale: ptBR }),
        total: 0,
        count: 0,
        items: [],
      };
    });

    const monthByKey = new Map(months.map((month) => [month.key, month]));

    for (const occurrence of source) {
      if (occurrence.status === "cancelled") {
        continue;
      }

      const dueDate = new Date(occurrence.dueDate);

      if (Number.isNaN(dueDate.getTime())) {
        continue;
      }

      const monthKey = format(dueDate, "yyyy-MM");
      const targetMonth = monthByKey.get(monthKey);

      if (!targetMonth) {
        continue;
      }

      targetMonth.total += occurrence.amount ?? 0;
      targetMonth.count += 1;
      targetMonth.items.push({
        id: occurrence.id,
        description: occurrence.description,
        dueDate: occurrence.dueDate,
        amount: occurrence.amount ?? 0,
        status: occurrence.status,
      });
    }

    for (const month of months) {
      month.items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    return months;
  }, [occurrencesQuery.data, rangeStart]);

  const chartData = useMemo(() => {
    return projectionMonths.map((month) => ({
      month: format(new Date(`${month.key}-01`), "MMM", { locale: ptBR }),
      total: month.total,
    }));
  }, [projectionMonths]);

  const projectedTotal = useMemo(
    () => projectionMonths.reduce((sum, month) => sum + month.total, 0),
    [projectionMonths],
  );

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader title={t("projection.title")} description={t("projection.description")} />

      {occurrencesQuery.isLoading ? (
        <LoadingState label={t("projection.loading")} />
      ) : occurrencesQuery.isError ? (
        <ErrorState
          title={t("projection.loadErrorTitle")}
          description={getErrorMessage(occurrencesQuery.error)}
          action={
            <Button variant="outline" onClick={() => occurrencesQuery.refetch()}>
              {t("actions.tryAgain")}
            </Button>
          }
        />
      ) : projectionMonths.every((month) => month.count === 0) ? (
        <EmptyState
          title={t("projection.noData")}
          description={t("projection.noDataDescription")}
        />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
            <SectionCard title={t("projection.chartTitle")} description={t("projection.chartDescription")}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      tickFormatter={(value) => `R$${Math.round(value / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(value) =>
                        currencyFormatter.format(Number(value ?? 0))
                      }
                    />
                    <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={t("projection.totalTitle")} description={t("projection.totalDescription")}>
              <div className="space-y-3">
                <p className="text-3xl font-semibold text-foreground">
                  {currencyFormatter.format(projectedTotal)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(rangeStart, "MMM yyyy", { locale: ptBR })} -{" "}
                  {format(rangeEnd, "MMM yyyy", { locale: ptBR })}
                </p>
              </div>
            </SectionCard>
          </section>

          <SectionCard title={t("projection.monthlyBreakdownTitle")} description={t("projection.monthlyBreakdownDescription")}>
            <div className="space-y-3">
              {projectionMonths.map((month) => {
                const isExpanded = Boolean(expandedMonths[month.key]);

                return (
                  <div key={month.key} className="rounded-lg border border-border/70">
                    <button
                      type="button"
                      className="ds-focus-ring flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
                      onClick={() => {
                        setExpandedMonths((current) => ({
                          ...current,
                          [month.key]: !current[month.key],
                        }));
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{month.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {month.count} {t("projection.occurrencesCount")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {currencyFormatter.format(month.total)}
                        </p>
                        <StatusBadge
                          label={month.count > 0 ? t("projection.hasData") : t("projection.emptyMonth")}
                          tone={month.count > 0 ? "info" : "neutral"}
                        />
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-border/70 px-4 py-3">
                        {month.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t("projection.noOccurrencesInMonth")}</p>
                        ) : (
                          <div className="space-y-2">
                            {month.items.map((item) => (
                              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {t("projection.duePrefix")} {format(new Date(item.dueDate), "dd/MM/yyyy")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-foreground">
                                    {currencyFormatter.format(item.amount)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.status
                                      ? t(`occurrences.statusFilter.${item.status}`)
                                      : t("common.unknown")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </>
      )}
    </AppPageContainer>
  );
}
