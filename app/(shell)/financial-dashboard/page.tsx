"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { startOfMonth } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  Clock3,
} from "lucide-react";
import { SectionCard } from "@/components/shared/data/section-card";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import {
  InlineFeedback,
  type InlineFeedbackTone,
} from "@/components/shared/feedback/inline-feedback";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { DashboardActionCard } from "@/features/dashboard/components/dashboard-action-card";
import {
  FinancialFilterBar,
  type FinanceStatusSegment,
} from "@/features/dashboard/components/financial-filter-bar";
import { FinancialOccurrencesPanel } from "@/features/dashboard/components/financial-occurrences-panel";
import { deriveFinancialKpis } from "@/features/dashboard/lib/financial-kpis";
import { useFinancialDashboardDataQuery } from "@/features/dashboard/hooks";
import {
  calculateMonthlyCardsSummary,
  formatCurrencyBRL,
} from "@/features/dashboard/monthly-aggregations";
import type { FinancialDashboardOccurrenceViewModel } from "@/features/dashboard/types";
import {
  useMarkOccurrencePaidMutation,
  useUnmarkOccurrencePaidMutation,
} from "@/features/occurrences/hooks";
import { OccurrenceStatus } from "@/features/occurrences/types";
import { useAuthorization } from "@/hooks/auth/use-authorization";
import { useViewScope } from "@/hooks/view/use-view-scope";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";

const allStatuses: OccurrenceStatus[] = ["pending", "paid", "overdue", "cancelled"];

function statusSegmentToApiStatuses(segment: FinanceStatusSegment): OccurrenceStatus[] {
  switch (segment) {
    case "all":
      return allStatuses;
    case "pending":
      return ["pending"];
    case "paid":
      return ["paid"];
    case "overdue":
      return ["overdue"];
    default:
      return allStatuses;
  }
}

function parseMonthInput(value: string) {
  const [yearValue, monthValue] = value.split("-");
  const year = Number.parseInt(yearValue ?? "", 10);
  const monthIndex = Number.parseInt(monthValue ?? "", 10) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11) {
    return null;
  }
  return startOfMonth(new Date(year, monthIndex, 1));
}

function FinancialDashboardContent() {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();

  const authorization = useAuthorization();
  const { scope, setScope } = useViewScope();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [statusSegment, setStatusSegment] = useState<FinanceStatusSegment>("all");
  const [listFeedback, setListFeedback] = useState<{
    tone: InlineFeedbackTone;
    message: string;
  } | null>(null);
  const [activePaymentItemId, setActivePaymentItemId] = useState<string | null>(null);
  const [flashRowId, setFlashRowId] = useState<string | null>(null);

  const listAnchorRef = useRef<HTMLDivElement | null>(null);

  const month = useMemo(
    () =>
      `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`,
    [currentMonth],
  );

  const apiStatuses = useMemo(
    () => statusSegmentToApiStatuses(statusSegment),
    [statusSegment],
  );

  const markPaidMutation = useMarkOccurrencePaidMutation();
  const unmarkPaidMutation = useUnmarkOccurrencePaidMutation();
  const cardsDataQuery = useFinancialDashboardDataQuery({
    scope,
    statuses: allStatuses,
    month,
  });
  const dashboardDataQuery = useFinancialDashboardDataQuery({
    scope,
    statuses: apiStatuses,
    month,
  });
  const categoriesQuery = useCategoriesListQuery();

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of categoriesQuery.data ?? []) {
      map.set(item.id, item.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const monthOccurrencesSorted = useMemo(() => {
    const rows: FinancialDashboardOccurrenceViewModel[] = [
      ...(dashboardDataQuery.data?.occurrences ?? []),
    ];
    function paymentSortMs(item: FinancialDashboardOccurrenceViewModel) {
      if (item.paidAt && Number.isFinite(item.paidAt.getTime())) {
        return item.paidAt.getTime();
      }
      return item.dueDate.getTime();
    }
    rows.sort((a, b) => {
      const diff = paymentSortMs(a) - paymentSortMs(b);
      if (diff !== 0) {
        return diff;
      }
      return a.id.localeCompare(b.id);
    });
    return rows;
  }, [dashboardDataQuery.data?.occurrences]);

  const timezone = dashboardDataQuery.data?.timezone ?? cardsDataQuery.data?.timezone ?? "UTC";

  const filteredBySearch = useMemo(() => {
    if (!searchQuery) {
      return monthOccurrencesSorted;
    }
    return monthOccurrencesSorted.filter((item) => {
      const cat = (categoriesById.get(item.categoryId ?? "") ?? "").toLowerCase();
      return (
        item.titleSnapshot.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        cat.includes(searchQuery)
      );
    });
  }, [monthOccurrencesSorted, searchQuery, categoriesById]);

  const cards = useMemo(() => {
    return calculateMonthlyCardsSummary(
      cardsDataQuery.data?.occurrences ?? [],
      cardsDataQuery.data?.timezone ?? "UTC",
    );
  }, [cardsDataQuery.data?.occurrences, cardsDataQuery.data?.timezone]);

  const kpis = useMemo(() => {
    return deriveFinancialKpis(cardsDataQuery.data?.occurrences ?? [], cardsDataQuery.data?.timezone ?? "UTC");
  }, [cardsDataQuery.data?.occurrences, cardsDataQuery.data?.timezone]);

  const hasMonthlyData = (dashboardDataQuery.data?.occurrences?.length ?? 0) > 0;
  const isInitialLoading =
    cardsDataQuery.isLoading &&
    dashboardDataQuery.isLoading &&
    !cardsDataQuery.data &&
    !dashboardDataQuery.data;
  const isRefreshing =
    (cardsDataQuery.isFetching || dashboardDataQuery.isFetching) &&
    Boolean(cardsDataQuery.data || dashboardDataQuery.data);

  const paymentMutationBusy = markPaidMutation.isPending || unmarkPaidMutation.isPending;

  const getCategoryLabel = useCallback(
    (categoryId?: string) => {
      if (!categoryId) {
        return t("common.notAvailable");
      }
      return categoriesById.get(categoryId) ?? t("common.unknown");
    },
    [categoriesById],
  );

  useEffect(() => {
    if (!flashRowId) {
      return;
    }
    const timer = window.setTimeout(() => setFlashRowId(null), 2200);
    return () => window.clearTimeout(timer);
  }, [flashRowId]);

  function scrollToOccurrences() {
    listAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function canOperatePayment(item: FinancialDashboardOccurrenceViewModel) {
    if (item.scope !== "FAMILY") {
      return true;
    }
    return authorization.canMarkFamilyAccountPaid || authorization.canEditFamilyAccount;
  }

  function getPaymentMutationErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.status === 403) {
      return t("occurrences.operationForbidden");
    }
    return getErrorMessage(error, t("financeDashboard.dailyList.updateStatusError"));
  }

  async function handlePaymentAction(item: FinancialDashboardOccurrenceViewModel) {
    if (!canOperatePayment(item)) {
      setListFeedback({ tone: "danger", message: t("occurrences.operationForbidden") });
      return;
    }

    setActivePaymentItemId(item.id);
    setListFeedback(null);

    try {
      if (item.status === "pending") {
        await markPaidMutation.mutateAsync(item.id);
        setListFeedback({ tone: "success", message: t("occurrences.markPaidSuccess") });
        setFlashRowId(item.id);
      } else if (item.status === "paid") {
        await unmarkPaidMutation.mutateAsync(item.id);
        setListFeedback({ tone: "success", message: t("occurrences.unmarkPaidSuccess") });
      }
    } catch (error) {
      setListFeedback({
        tone: "danger",
        message: getPaymentMutationErrorMessage(error),
      });
    } finally {
      setActivePaymentItemId(null);
    }
  }

  if (isInitialLoading) {
    return (
      <AppPageContainer className="space-y-8">
        <PageHeader title={t("financeDashboard.title")} description={t("financeDashboard.description")} />
        <LoadingState label={t("financeDashboard.loadingInitial")} className="min-h-32" />
      </AppPageContainer>
    );
  }

  const cardsLoading = cardsDataQuery.isLoading;

  return (
    <AppPageContainer className="space-y-8 sm:space-y-10">
      <PageHeader title={t("financeDashboard.title")} description={t("financeDashboard.description")} />

      <FinancialFilterBar
        scope={scope}
        onScopeChange={setScope}
        month={month}
        onMonthChange={(value) => {
          const next = parseMonthInput(value);
          if (next) {
            setCurrentMonth(next);
          }
        }}
        statusSegment={statusSegment}
        onStatusSegmentChange={setStatusSegment}
      />

      {isRefreshing ? (
        <InlineFeedback tone="info" message={t("financeDashboard.revalidating")} />
      ) : null}

      {cardsDataQuery.isError ? (
        <ErrorState
          title={t("financeDashboard.loadErrorTitle")}
          description={getErrorMessage(cardsDataQuery.error)}
          action={
            <Button variant="outline" onClick={() => cardsDataQuery.refetch()}>
              {t("actions.tryAgain")}
            </Button>
          }
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardActionCard
            tone="danger"
            title={t("financeDashboard.actionCards.overdueTitle")}
            icon={AlertTriangle}
            primaryLine={
              cardsLoading
                ? "…"
                : t("financeDashboard.overdueCountSummary", {
                    values: { count: String(cards.overdueCount) },
                  })
            }
            secondaryLine={
              cardsLoading
                ? undefined
                : t("financeDashboard.cards.overdueAmount", {
                    values: { amount: formatCurrencyBRL(cards.overdueAmount) },
                  })
            }
            actionLabel={t("financeDashboard.actionCards.overdueAction")}
            onAction={() => {
              setStatusSegment("overdue");
              scrollToOccurrences();
            }}
            loading={cardsLoading}
          />
          <DashboardActionCard
            tone="info"
            title={t("financeDashboard.actionCards.pendingTitle")}
            icon={Clock3}
            primaryLine={cardsLoading ? "…" : formatCurrencyBRL(kpis.pendingTotal)}
            actionLabel={t("financeDashboard.actionCards.pendingAction")}
            onAction={() => {
              setStatusSegment("pending");
              scrollToOccurrences();
            }}
            loading={cardsLoading}
          />
          <DashboardActionCard
            tone="success"
            title={t("financeDashboard.actionCards.paidTitle")}
            icon={CircleDollarSign}
            primaryLine={cardsLoading ? "…" : formatCurrencyBRL(kpis.paidTotal)}
            actionLabel={t("financeDashboard.actionCards.paidAction")}
            onAction={() => {
              setStatusSegment("paid");
              scrollToOccurrences();
            }}
            loading={cardsLoading}
          />
          <DashboardActionCard
            tone="warning"
            title={t("financeDashboard.actionCards.upcomingTitle")}
            icon={CalendarClock}
            primaryLine={
              cardsLoading
                ? "…"
                : t("financeDashboard.upcomingCountSummary", {
                    values: { count: String(kpis.upcoming7Count) },
                  })
            }
            secondaryLine={t("financeDashboard.actionCards.upcomingSubtitle")}
            actionLabel={t("financeDashboard.actionCards.upcomingAction")}
            onAction={() => {
              setStatusSegment("pending");
              scrollToOccurrences();
            }}
            loading={cardsLoading}
          />
        </section>
      )}

      {!dashboardDataQuery.isLoading && !dashboardDataQuery.isError && !hasMonthlyData ? (
        <EmptyState
          title={t("financeDashboard.emptyMonthTitle")}
          description={t("financeDashboard.emptyMonthDescription")}
        />
      ) : null}

      <div ref={listAnchorRef} className="scroll-mt-24" />

      <SectionCard
        dense
        title={t("financeDashboard.monthOccurrencesList.title")}
        description={t("financeDashboard.monthOccurrencesList.description")}
        className="w-full max-w-none rounded-xl border-border/40 shadow-sm"
      >
        {dashboardDataQuery.isLoading ? (
          <LoadingState label={t("states.loading")} className="min-h-24" />
        ) : dashboardDataQuery.isError ? (
          <ErrorState
            title={t("financeDashboard.loadErrorTitle")}
            description={getErrorMessage(dashboardDataQuery.error)}
            action={
              <Button variant="outline" onClick={() => dashboardDataQuery.refetch()}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : filteredBySearch.length === 0 ? (
          <EmptyState
            title={t("financeDashboard.monthOccurrencesList.emptyTitle")}
            description={t("financeDashboard.monthOccurrencesList.emptyDescription")}
          />
        ) : (
          <div className="space-y-4">
            {listFeedback ? (
              <InlineFeedback tone={listFeedback.tone} message={listFeedback.message} />
            ) : null}
            <FinancialOccurrencesPanel
              items={filteredBySearch}
              timezone={timezone}
              getCategoryLabel={getCategoryLabel}
              paymentMutationBusy={paymentMutationBusy}
              activePaymentItemId={activePaymentItemId}
              flashSuccessId={flashRowId}
              onPayment={handlePaymentAction}
            />
          </div>
        )}
      </SectionCard>
    </AppPageContainer>
  );
}

export default function FinancialDashboardPage() {
  return (
    <Suspense
      fallback={
        <AppPageContainer className="space-y-8">
          <PageHeader title={t("financeDashboard.title")} description={t("financeDashboard.description")} />
          <LoadingState label={t("financeDashboard.loadingInitial")} className="min-h-32" />
        </AppPageContainer>
      }
    >
      <FinancialDashboardContent />
    </Suspense>
  );
}
