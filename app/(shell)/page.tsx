"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TriangleAlert } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { SummaryCard } from "@/components/shared/data/summary-card";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import {
  useDashboardCategorySummaryQuery,
  useDashboardDayQuery,
  useDashboardHomeQuery,
  useDashboardNext12MonthsQuery,
} from "@/features/dashboard/hooks";
import { DashboardHomeOccurrenceDto } from "@/features/dashboard/types";
import { getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const categoryChartColors = [
  "#2563EB",
  "#7C3AED",
  "#16A34A",
  "#F59E0B",
  "#DC2626",
  "#0EA5E9",
  "#475569",
];

function parseAmount(value: unknown) {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeStatus(value: unknown): "pending" | "paid" | "overdue" | "cancelled" | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  switch (value.toUpperCase()) {
    case "PENDING":
      return "pending";
    case "PAID":
      return "paid";
    case "OVERDUE":
      return "overdue";
    case "CANCELLED":
      return "cancelled";
    default:
      return undefined;
  }
}

function getOccurrenceTone(status?: string) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === "paid") {
    return "success" as const;
  }

  if (normalizedStatus === "overdue") {
    return "danger" as const;
  }

  if (normalizedStatus === "pending") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getOccurrenceLabel(status?: string) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus) {
    return t(`occurrences.statusFilter.${normalizedStatus}`);
  }

  return t("common.unknown");
}

export default function DashboardPage() {
  const now = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(format(now, "yyyy-MM-dd"));

  const categoriesQuery = useCategoriesListQuery();
  const dashboardMonth = format(now, "yyyy-MM");
  const dashboardHomeQuery = useDashboardHomeQuery(dashboardMonth);
  const dashboardDayQuery = useDashboardDayQuery(selectedDate);
  const categorySummaryQuery = useDashboardCategorySummaryQuery(dashboardMonth);
  const projectionQuery = useDashboardNext12MonthsQuery(false);

  const dashboardHome = dashboardHomeQuery.data;
  const overdueOccurrences = dashboardHome?.overdue ?? [];
  const next7DaysOccurrences = dashboardHome?.next7Days ?? [];
  const upcomingOccurrences = dashboardHome?.upcoming ?? [];

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categoriesQuery.data]);

  const categorySummaryData = useMemo(() => {
    return (categorySummaryQuery.data?.items ?? [])
      .map((item, index) => ({
        categoryId: item.categoryId ?? "uncategorized",
        name: categoriesById.get(item.categoryId) ?? t("common.unknown"),
        total: parseAmount(item.totalAmount),
        color: categoryChartColors[index % categoryChartColors.length],
      }))
      .sort((a, b) => b.total - a.total);
  }, [categoriesById, categorySummaryQuery.data?.items]);

  const totalPending = parseAmount(dashboardHome?.totalPendingInMonth);
  const totalPaid = parseAmount(dashboardHome?.totalPaidInMonth);
  const overdueCount = overdueOccurrences.length;
  const projectionTotal = (projectionQuery.data?.points ?? []).reduce(
    (sum, item) => sum + parseAmount((item as { totalAmount?: unknown }).totalAmount),
    0,
  );
  const selectedDayItems = (dashboardDayQuery.data?.items ?? []) as DashboardHomeOccurrenceDto[];

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader title={t("dashboard.title")} description={t("dashboard.description")} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label={t("dashboard.overdueOccurrences")}
          value={
            dashboardHomeQuery.isLoading ? "..." : String(overdueCount)
          }
          hint={t("dashboard.overdueHint")}
          icon={<TriangleAlert className="size-4 text-destructive" />}
        />
        <SummaryCard
          label={t("dashboard.dueNext7Days")}
          value={dashboardHomeQuery.isLoading ? "..." : String(next7DaysOccurrences.length)}
          hint={t("dashboard.next7DaysHint")}
        />
        <SummaryCard
          label={t("dashboard.pendingThisMonth")}
          value={
            dashboardHomeQuery.isLoading
              ? "..."
              : currencyFormatter.format(totalPending)
          }
        />
        <SummaryCard
          label={t("dashboard.paidThisMonth")}
          value={
            dashboardHomeQuery.isLoading
              ? "..."
              : currencyFormatter.format(totalPaid)
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title={t("dashboard.upcomingOccurrences")}
          description={t("dashboard.upcomingOccurrencesDescription")}
        >
          {dashboardHomeQuery.isLoading ? (
            <LoadingState label={t("dashboard.loadingDashboard")} className="min-h-24" />
          ) : dashboardHomeQuery.isError ? (
            <ErrorState
              title={t("dashboard.couldNotLoadDashboard")}
              description={getErrorMessage(dashboardHomeQuery.error)}
              action={
                <Button variant="outline" onClick={() => dashboardHomeQuery.refetch()}>
                  {t("actions.tryAgain")}
                </Button>
              }
            />
          ) : upcomingOccurrences.length === 0 ? (
            <EmptyState
              title={t("dashboard.noUpcomingOccurrences")}
              description={t("dashboard.noUpcomingOccurrencesDescription")}
            />
          ) : (
            <div className="space-y-2">
              {upcomingOccurrences.map((occurrence) => (
                <div
                  key={occurrence.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {occurrence.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("projection.duePrefix")}{" "}
                      {format(new Date(occurrence.dueDate), "dd/MM")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {currencyFormatter.format(parseAmount(occurrence.amount))}
                    </p>
                    <StatusBadge
                      label={getOccurrenceLabel(occurrence.status)}
                      tone={getOccurrenceTone(occurrence.status)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={t("dashboard.categorySummary")}
          description={t("dashboard.categorySummaryDescription")}
        >
          {categorySummaryQuery.isLoading ? (
            <LoadingState label={t("states.loading")} className="min-h-24" />
          ) : categorySummaryQuery.isError ? (
            <ErrorState
              title={t("dashboard.couldNotLoadDashboard")}
              description={getErrorMessage(categorySummaryQuery.error)}
              action={
                <Button variant="outline" onClick={() => categorySummaryQuery.refetch()}>
                  {t("actions.tryAgain")}
                </Button>
              }
            />
          ) : categorySummaryData.length === 0 ? (
            <EmptyState
              title={t("dashboard.noCategoryData")}
              description={t("dashboard.noCategoryDataDescription")}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-[1.2fr,1fr]">
              <div className="h-56 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySummaryData}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={92}
                    >
                      {categorySummaryData.map((entry) => (
                        <Cell key={entry.categoryId} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        currencyFormatter.format(Number(value ?? 0))
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categorySummaryData.map((entry) => (
                  <div
                    key={entry.categoryId}
                    className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-foreground">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {currencyFormatter.format(entry.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title={t("dashboard.dayViewTitle")}
          description={t("dashboard.dayViewDescription")}
        >
          <div className="mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            />
          </div>
          {dashboardDayQuery.isLoading ? (
            <LoadingState label={t("states.loading")} className="min-h-24" />
          ) : dashboardDayQuery.isError ? (
            <ErrorState
              title={t("dashboard.couldNotLoadDashboard")}
              description={getErrorMessage(dashboardDayQuery.error)}
              action={
                <Button variant="outline" onClick={() => dashboardDayQuery.refetch()}>
                  {t("actions.tryAgain")}
                </Button>
              }
            />
          ) : selectedDayItems.length === 0 ? (
            <EmptyState
              title={t("dashboard.noOccurrencesInDay")}
              description={t("dashboard.noOccurrencesInDayDescription")}
            />
          ) : (
            <div className="space-y-2">
              {selectedDayItems.map((occurrence) => (
                <div key={occurrence.id} className="rounded-md border border-border/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{occurrence.title}</p>
                    <StatusBadge
                      label={getOccurrenceLabel(occurrence.status)}
                      tone={getOccurrenceTone(occurrence.status)}
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currencyFormatter.format(parseAmount(occurrence.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={t("projection.totalTitle")}
          description={t("projection.totalDescription")}
          action={
            <Link
              href="/next-12-months"
              className="ds-focus-ring inline-flex items-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              {t("navigation.next12Months")}
            </Link>
          }
        >
          {projectionQuery.isLoading ? (
            <LoadingState label={t("projection.loading")} className="min-h-24" />
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
          ) : (
            <div className="space-y-2">
              <p className="text-3xl font-semibold text-foreground">
                {currencyFormatter.format(projectionTotal)}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(now, "MMMM yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
        </SectionCard>
      </section>
    </AppPageContainer>
  );
}
