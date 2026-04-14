"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, List, TriangleAlert } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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
import { useDashboardSummaryQuery } from "@/features/dashboard/hooks";
import { useOccurrencesListQuery } from "@/features/occurrences/hooks";
import { OccurrenceDto } from "@/features/occurrences/types";
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

type DashboardMode = "calendar" | "list";

function getMonthDays(monthDate: Date) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

function toDateSafe(value: string) {
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getOccurrenceTone(occurrence: OccurrenceDto) {
  if (occurrence.status === "paid") {
    return "success" as const;
  }

  if (occurrence.status === "overdue") {
    return "danger" as const;
  }

  if (occurrence.status === "pending") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function getOccurrenceLabel(occurrence: OccurrenceDto) {
  if (occurrence.status) {
    return t(`occurrences.statusFilter.${occurrence.status}`);
  }

  return t("common.unknown");
}

export default function DashboardPage() {
  const now = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<DashboardMode>("calendar");
  const [selectedDay, setSelectedDay] = useState<Date>(now);

  const monthStart = useMemo(() => startOfMonth(now), [now]);
  const monthEnd = useMemo(() => endOfMonth(now), [now]);

  const monthOccurrencesQuery = useOccurrencesListQuery({
    fromDate: format(monthStart, "yyyy-MM-dd"),
    toDate: format(monthEnd, "yyyy-MM-dd"),
  });

  const overdueQuery = useOccurrencesListQuery({
    status: "overdue",
    size: 20,
  });

  const next7DaysQuery = useOccurrencesListQuery({
    fromDate: format(now, "yyyy-MM-dd"),
    toDate: format(addDays(now, 7), "yyyy-MM-dd"),
    size: 50,
  });

  const categoriesQuery = useCategoriesListQuery();
  const dashboardSummaryQuery = useDashboardSummaryQuery();

  const hasBaseError =
    monthOccurrencesQuery.isError ||
    overdueQuery.isError ||
    next7DaysQuery.isError ||
    categoriesQuery.isError;

  const isBaseLoading =
    monthOccurrencesQuery.isLoading ||
    overdueQuery.isLoading ||
    next7DaysQuery.isLoading ||
    categoriesQuery.isLoading;

  const monthOccurrences = useMemo(
    () => monthOccurrencesQuery.data ?? [],
    [monthOccurrencesQuery.data],
  );
  const overdueOccurrences = useMemo(
    () => overdueQuery.data ?? [],
    [overdueQuery.data],
  );
  const next7DaysOccurrences = useMemo(
    () => next7DaysQuery.data ?? [],
    [next7DaysQuery.data],
  );

  const pendingThisMonth = useMemo(() => {
    return monthOccurrences
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }, [monthOccurrences]);

  const paidThisMonth = useMemo(() => {
    return monthOccurrences
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }, [monthOccurrences]);

  const upcomingOccurrences = useMemo(() => {
    const today = now.getTime();

    return [...monthOccurrences]
      .filter((item) => {
        const dueDate = toDateSafe(item.dueDate);

        if (!dueDate) {
          return false;
        }

        return dueDate.getTime() >= today && item.status !== "paid";
      })
      .sort(
        (a, b) =>
          (toDateSafe(a.dueDate)?.getTime() ?? 0) -
          (toDateSafe(b.dueDate)?.getTime() ?? 0),
      )
      .slice(0, 8);
  }, [monthOccurrences, now]);

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categoriesQuery.data]);

  const categorySummaryData = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    for (const occurrence of monthOccurrences) {
      if (occurrence.status === "cancelled") {
        continue;
      }

      const key = occurrence.categoryId ?? "uncategorized";
      categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + (occurrence.amount ?? 0));
    }

    return Array.from(categoryTotals.entries())
      .map(([categoryId, total], index) => ({
        categoryId,
        name:
          categoryId === "uncategorized"
            ? t("common.unknown")
            : (categoriesById.get(categoryId) ?? t("common.unknown")),
        total,
        color: categoryChartColors[index % categoryChartColors.length],
      }))
      .sort((a, b) => b.total - a.total);
  }, [categoriesById, monthOccurrences]);

  const calendarDays = useMemo(() => getMonthDays(now), [now]);

  const dayOccurrences = useMemo(() => {
    return monthOccurrences.filter((occurrence) => {
      const dueDate = toDateSafe(occurrence.dueDate);
      return dueDate ? isSameDay(dueDate, selectedDay) : false;
    });
  }, [monthOccurrences, selectedDay]);

  const summaryFromBackend = dashboardSummaryQuery.data;

  const totalPending = summaryFromBackend?.totalPending ?? pendingThisMonth;
  const totalPaid = summaryFromBackend?.totalPaid ?? paidThisMonth;
  const overdueCount = summaryFromBackend?.overdueCount ?? overdueOccurrences.length;

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actions={
          <div className="flex gap-2">
            <Button
              variant={mode === "calendar" ? "default" : "outline"}
              onClick={() => setMode("calendar")}
            >
              <CalendarDays className="size-4" />
              {t("actions.calendar")}
            </Button>
            <Button
              variant={mode === "list" ? "default" : "outline"}
              onClick={() => setMode("list")}
            >
              <List className="size-4" />
              {t("actions.list")}
            </Button>
          </div>
        }
      />

      {hasBaseError ? (
        <ErrorState
          title={t("dashboard.couldNotLoadDashboard")}
          description={
            getErrorMessage(monthOccurrencesQuery.error) ||
            getErrorMessage(overdueQuery.error) ||
            getErrorMessage(next7DaysQuery.error) ||
            getErrorMessage(categoriesQuery.error)
          }
          action={
            <Button
              variant="outline"
              onClick={() => {
                monthOccurrencesQuery.refetch();
                overdueQuery.refetch();
                next7DaysQuery.refetch();
                categoriesQuery.refetch();
                dashboardSummaryQuery.refetch();
              }}
            >
              {t("actions.tryAgain")}
            </Button>
          }
        />
      ) : isBaseLoading ? (
        <LoadingState label={t("dashboard.loadingDashboard")} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label={t("dashboard.overdueOccurrences")}
              value={String(overdueCount)}
              hint={t("dashboard.overdueHint")}
              icon={<TriangleAlert className="size-4 text-destructive" />}
            />
            <SummaryCard
              label={t("dashboard.dueNext7Days")}
              value={String(next7DaysOccurrences.length)}
              hint={t("dashboard.next7DaysHint")}
            />
            <SummaryCard
              label={t("dashboard.pendingThisMonth")}
              value={currencyFormatter.format(totalPending)}
            />
            <SummaryCard
              label={t("dashboard.paidThisMonth")}
              value={currencyFormatter.format(totalPaid)}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title={t("dashboard.upcomingOccurrences")}
              description={t("dashboard.upcomingOccurrencesDescription")}
            >
              {upcomingOccurrences.length === 0 ? (
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
                          {occurrence.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("projection.duePrefix")} {format(toDateSafe(occurrence.dueDate) ?? now, "dd/MM")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {currencyFormatter.format(occurrence.amount ?? 0)}
                        </p>
                        <StatusBadge
                          label={getOccurrenceLabel(occurrence)}
                          tone={getOccurrenceTone(occurrence)}
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
              {categorySummaryData.length === 0 ? (
                <EmptyState
                  title={t("dashboard.noCategoryData")}
                  description={t("dashboard.noCategoryDataDescription")}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-[1.2fr,1fr]">
                  <div className="h-56">
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

          {mode === "calendar" ? (
            <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
              <SectionCard
                title={format(now, "MMMM yyyy", { locale: ptBR })}
                description={t("dashboard.calendarMonthDescription")}
              >
                <div className="mb-3 grid grid-cols-7 text-center text-xs uppercase tracking-wide text-muted-foreground">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const inCurrentMonth = isSameMonth(day, now);
                    const isSelected = isSameDay(day, selectedDay);
                    const hasItems = monthOccurrences.some((occurrence) => {
                      const dueDate = toDateSafe(occurrence.dueDate);
                      return dueDate ? isSameDay(dueDate, day) : false;
                    });

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        className={`ds-focus-ring flex min-h-16 flex-col items-start rounded-md border px-2 py-1.5 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border/70 bg-background hover:bg-muted"
                        } ${inCurrentMonth ? "text-foreground" : "text-muted-foreground/60"}`}
                        onClick={() => setSelectedDay(day)}
                      >
                        <span className="text-xs font-medium">{format(day, "d")}</span>
                        {hasItems ? <span className="mt-1 size-1.5 rounded-full bg-primary" /> : null}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard
                title={`${t("dashboard.occurrencesOnDay")} ${format(selectedDay, "dd/MM")}`}
                description={t("states.noData")}
              >
                {dayOccurrences.length === 0 ? (
                  <EmptyState
                    title={t("dashboard.noOccurrencesInDay")}
                    description={t("dashboard.noOccurrencesInDayDescription")}
                  />
                ) : (
                  <div className="space-y-2">
                    {dayOccurrences.map((occurrence) => (
                      <div
                        key={occurrence.id}
                        className="rounded-md border border-border/70 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {occurrence.description}
                          </p>
                          <StatusBadge
                            label={getOccurrenceLabel(occurrence)}
                            tone={getOccurrenceTone(occurrence)}
                          />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {currencyFormatter.format(occurrence.amount ?? 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </section>
          ) : (
            <SectionCard
              title={`${t("dashboard.currentMonthList")} (${format(now, "MMMM", { locale: ptBR })})`}
              description={t("dashboard.currentMonthListDescription")}
            >
              {monthOccurrences.length === 0 ? (
                <EmptyState
                  title={t("dashboard.noOccurrencesInMonth")}
                  description={t("dashboard.noOccurrencesInMonthDescription")}
                />
              ) : (
                <div className="space-y-2">
                  {[...monthOccurrences]
                    .sort(
                      (a, b) =>
                        (toDateSafe(a.dueDate)?.getTime() ?? 0) -
                        (toDateSafe(b.dueDate)?.getTime() ?? 0),
                    )
                    .map((occurrence) => (
                      <div
                        key={occurrence.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {occurrence.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("projection.duePrefix")} {format(toDateSafe(occurrence.dueDate) ?? now, "dd/MM")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {currencyFormatter.format(occurrence.amount ?? 0)}
                          </p>
                          <StatusBadge
                            label={getOccurrenceLabel(occurrence)}
                            tone={getOccurrenceTone(occurrence)}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </SectionCard>
          )}
        </>
      )}
    </AppPageContainer>
  );
}
