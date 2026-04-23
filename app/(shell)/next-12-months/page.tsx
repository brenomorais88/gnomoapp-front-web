"use client";

import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
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
import { useDashboardNext12MonthsQuery } from "@/features/dashboard/hooks";
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
  const rangeStart = now;
  const rangeEnd = addMonths(now, 11);

  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const projectionQuery = useDashboardNext12MonthsQuery(true);

  const projectionMonths = useMemo<MonthProjection[]>(() => {
    return (projectionQuery.data?.points ?? []).map((rawPoint) => {
      const point = rawPoint as Record<string, unknown>;
      const month = String(point.month ?? "");
      const total = Number.parseFloat(String(point.totalAmount ?? 0));
      const details = Array.isArray(point.items) ? point.items : [];

      return {
        key: month,
        label: month
          ? format(new Date(`${month}-01`), "MMMM yyyy", { locale: ptBR })
          : t("common.unknown"),
        total: Number.isNaN(total) ? 0 : total,
        count: Number(point.count ?? details.length ?? 0),
        items: details.map((rawItem) => {
          const item = rawItem as Record<string, unknown>;
          return {
            id: String(item.id ?? ""),
            description: String(item.description ?? item.title ?? ""),
            dueDate: String(item.dueDate ?? ""),
            amount: Number.parseFloat(String(item.amount ?? 0)) || 0,
            status: item.status ? String(item.status).toLowerCase() : undefined,
          };
        }),
      };
    });
  }, [projectionQuery.data?.points]);

  const chartData = useMemo(() => {
    return projectionMonths.map((month) => ({
      month: month.key
        ? format(new Date(`${month.key}-01`), "MMM", { locale: ptBR })
        : t("common.unknown"),
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

      {projectionQuery.isLoading ? (
        <LoadingState label={t("projection.loading")} />
      ) : projectionQuery.isError ? (
        <ErrorState
          title={t("projection.loadErrorTitle")}
          description={getErrorMessage(projectionQuery.error)}
          action={
            <Button variant="outline" onClick={() => projectionQuery.refetch()}>
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
              <div className="h-64 min-w-0">
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
