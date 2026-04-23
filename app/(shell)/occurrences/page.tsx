"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/shared/data/data-table";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { Toolbar } from "@/components/shared/data/toolbar";
import { ViewScopeSelector } from "@/components/shared/filters/view-scope-selector";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAccountsListQuery } from "@/features/accounts/hooks";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import {
  useOccurrenceDetailQuery,
  useOccurrencesListQuery,
  useMarkOccurrencePaidMutation,
  useOverrideOccurrenceAmountMutation,
  useUnmarkOccurrencePaidMutation,
} from "@/features/occurrences/hooks";
import {
  OccurrenceDto,
  OccurrenceListQuery,
  OccurrenceStatus,
} from "@/features/occurrences/types";
import { AccountListScope } from "@/features/accounts/types";
import { occurrenceOverrideSchema } from "@/features/occurrences/schema";
import { useAuthorization } from "@/hooks/auth/use-authorization";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";
import { useViewScope } from "@/hooks/view/use-view-scope";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Feedback = {
  tone: "success" | "danger";
  message: string;
};

const statusOptions: { label: string; value: "all" | OccurrenceStatus }[] = [
  { label: t("occurrences.statusFilter.all"), value: "all" },
  { label: t("occurrences.statusFilter.pending"), value: "pending" },
  { label: t("occurrences.statusFilter.paid"), value: "paid" },
  { label: t("occurrences.statusFilter.overdue"), value: "overdue" },
  { label: t("occurrences.statusFilter.cancelled"), value: "cancelled" },
];

function getStatusTone(status?: string) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "overdue") {
    return "danger" as const;
  }

  if (status === "pending") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function sortOccurrences(items: OccurrenceDto[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.dueDate).getTime();
    const bTime = new Date(b.dueDate).getTime();
    return aTime - bTime;
  });
}

export default function OccurrencesPage() {
  const authorization = useAuthorization();
  const [textFilter, setTextFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OccurrenceStatus>("all");
  const [categoryIdFilter, setCategoryIdFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { scope: scopeFilter, setScope: setScopeFilter, label: scopeLabel } = useViewScope();

  const listParams = useMemo<OccurrenceListQuery>(
    () => ({
      scope: scopeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      categoryId: categoryIdFilter || undefined,
      text: textFilter || undefined,
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined,
      month: monthFilter || undefined,
      size: 300,
    }),
    [
      categoryIdFilter,
      endDateFilter,
      monthFilter,
      scopeFilter,
      startDateFilter,
      statusFilter,
      textFilter,
    ],
  );

  const occurrencesQuery = useOccurrencesListQuery(listParams);
  const categoriesQuery = useCategoriesListQuery({ size: 300 });
  const accountsQuery = useAccountsListQuery({ size: 300, scope: scopeFilter });
  const markPaidMutation = useMarkOccurrencePaidMutation();
  const unmarkPaidMutation = useUnmarkOccurrencePaidMutation();
  const overrideAmountMutation = useOverrideOccurrenceAmountMutation();
  const detailQuery = useOccurrenceDetailQuery(selectedOccurrenceId ?? "");

  const occurrences = useMemo(
    () => sortOccurrences(occurrencesQuery.data ?? []),
    [occurrencesQuery.data],
  );

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of categoriesQuery.data ?? []) {
      map.set(item.id, item.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const accountsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of accountsQuery.data ?? []) {
      map.set(item.id, item.title);
    }
    return map;
  }, [accountsQuery.data]);

  const isBaseLoading =
    occurrencesQuery.isLoading || categoriesQuery.isLoading || accountsQuery.isLoading;
  const baseError = occurrencesQuery.error ?? categoriesQuery.error ?? accountsQuery.error;

  function canOperateOccurrence(item: OccurrenceDto) {
    if (item.scope !== "FAMILY") {
      return true;
    }

    return authorization.canMarkFamilyAccountPaid || authorization.canEditFamilyAccount;
  }

  function parseOverrideAmountInput(input: string) {
    const parsed = occurrenceOverrideSchema.safeParse({ amount: input });
    if (!parsed.success) {
      return null;
    }

    return parsed.data.amount.toFixed(2);
  }

  function getOperationErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.status === 403) {
      return t("occurrences.operationForbidden");
    }

    return getErrorMessage(error, t("occurrences.loadErrorTitle"));
  }

  async function handleMarkPaid(item: OccurrenceDto) {
    if (!canOperateOccurrence(item)) {
      setFeedback({ tone: "danger", message: t("occurrences.operationForbidden") });
      return;
    }

    try {
      await markPaidMutation.mutateAsync(item.id);
      setFeedback({ tone: "success", message: t("occurrences.markPaidSuccess") });
    } catch (error) {
      setFeedback({ tone: "danger", message: getOperationErrorMessage(error) });
    }
  }

  async function handleUnmarkPaid(item: OccurrenceDto) {
    if (!canOperateOccurrence(item)) {
      setFeedback({ tone: "danger", message: t("occurrences.operationForbidden") });
      return;
    }

    try {
      await unmarkPaidMutation.mutateAsync(item.id);
      setFeedback({ tone: "success", message: t("occurrences.unmarkPaidSuccess") });
    } catch (error) {
      setFeedback({ tone: "danger", message: getOperationErrorMessage(error) });
    }
  }

  async function handleOverrideAmount(item: OccurrenceDto) {
    if (!canOperateOccurrence(item)) {
      setFeedback({ tone: "danger", message: t("occurrences.operationForbidden") });
      return;
    }

    const userInput = window.prompt(
      t("occurrences.overrideAmountPrompt", {
        values: { currentAmount: String(item.amount ?? 0) },
      }),
    );

    if (!userInput) {
      return;
    }

    const normalizedAmount = parseOverrideAmountInput(userInput);

    if (!normalizedAmount) {
      setFeedback({ tone: "danger", message: t("occurrences.overrideAmountInvalid") });
      return;
    }

    try {
      await overrideAmountMutation.mutateAsync({
        id: item.id,
        amount: normalizedAmount,
      });
      setFeedback({ tone: "success", message: t("occurrences.overrideAmountSuccess") });
    } catch (error) {
      setFeedback({ tone: "danger", message: getOperationErrorMessage(error) });
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("occurrences.title")}
        description={t("occurrences.description")}
      />

      {feedback ? (
        <InlineFeedback tone={feedback.tone} message={feedback.message} />
      ) : null}

      <SectionCard
        title={t("viewScope.currentContextTitle")}
        description={t("viewScope.currentContextDescription", { values: { context: scopeLabel } })}
      >
        <ViewScopeSelector value={scopeFilter} onChange={setScopeFilter} />
      </SectionCard>

      <Toolbar
        left={
          <div className="grid w-full gap-2 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder={t("occurrences.searchPlaceholder")}
              value={textFilter}
              onChange={(event) => setTextFilter(event.target.value)}
            />
            <select
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | OccurrenceStatus)
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={categoryIdFilter}
              onChange={(event) => setCategoryIdFilter(event.target.value)}
            >
              <option value="">{t("occurrences.filterAllCategories")}</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={startDateFilter}
              onChange={(event) => setStartDateFilter(event.target.value)}
            />
            <input
              type="date"
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={endDateFilter}
              onChange={(event) => setEndDateFilter(event.target.value)}
            />
            <input
              type="month"
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            />
          </div>
        }
      />

      {selectedOccurrenceId ? (
        <SectionCard
          title={t("occurrences.detailTitle")}
          description={t("occurrences.detailDescription")}
        >
          {detailQuery.isLoading ? (
            <LoadingState label={t("occurrences.loadingDetail")} />
          ) : detailQuery.isError ? (
            <ErrorState
              title={t("occurrences.loadDetailErrorTitle")}
              description={getErrorMessage(detailQuery.error)}
              action={
                <Button variant="outline" onClick={() => detailQuery.refetch()}>
                  {t("actions.tryAgain")}
                </Button>
              }
            />
          ) : detailQuery.data ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("occurrences.table.description")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {detailQuery.data.description}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("occurrences.table.amount")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currencyFormatter.format(detailQuery.data.amount ?? 0)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("occurrences.table.dueDate")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(detailQuery.data.dueDate)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("occurrences.table.account")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {detailQuery.data.accountId
                    ? accountsById.get(detailQuery.data.accountId) ?? t("common.unknown")
                    : t("common.notAvailable")}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("occurrences.table.category")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {detailQuery.data.categoryId
                    ? categoriesById.get(detailQuery.data.categoryId) ?? t("common.unknown")
                    : t("common.notAvailable")}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("occurrences.table.status")}</p>
                <div className="mt-1">
                  <StatusBadge
                    label={
                      detailQuery.data.status
                        ? t(`occurrences.statusFilter.${detailQuery.data.status}`)
                        : t("common.unknown")
                    }
                    tone={getStatusTone(detailQuery.data.status)}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-4">
            <Button variant="outline" onClick={() => setSelectedOccurrenceId(null)}>
              {t("actions.close")}
            </Button>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title={t("occurrences.listTitle")}
        description={t("occurrences.listDescription")}
      >
        {isBaseLoading ? (
          <LoadingState label={t("occurrences.loadingList")} />
        ) : baseError ? (
          <ErrorState
            title={t("occurrences.loadErrorTitle")}
            description={getErrorMessage(baseError)}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  occurrencesQuery.refetch();
                  categoriesQuery.refetch();
                  accountsQuery.refetch();
                }}
              >
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : occurrences.length === 0 ? (
          <EmptyState
            title={t("occurrences.noOccurrences")}
            description={t("occurrences.noOccurrencesDescription")}
          />
        ) : (
          <DataTable>
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("occurrences.table.description")}</th>
                <th className="px-4 py-3 font-medium">{t("occurrences.table.account")}</th>
                <th className="px-4 py-3 font-medium">{t("occurrences.table.category")}</th>
                <th className="px-4 py-3 font-medium">{t("occurrences.table.dueDate")}</th>
                <th className="px-4 py-3 font-medium">{t("occurrences.table.amount")}</th>
                <th className="px-4 py-3 font-medium">{t("occurrences.table.status")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("occurrences.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {occurrences.map((item) => (
                <tr key={item.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">{item.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.accountId
                      ? accountsById.get(item.accountId) ?? t("common.unknown")
                      : t("common.notAvailable")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.categoryId
                      ? categoriesById.get(item.categoryId) ?? t("common.unknown")
                      : t("common.notAvailable")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-3 text-foreground">
                    {currencyFormatter.format(item.amount ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={
                        item.status
                          ? t(`occurrences.statusFilter.${item.status}`)
                          : t("common.unknown")
                      }
                      tone={getStatusTone(item.status)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOccurrenceId(item.id)}
                      >
                        <Eye className="size-3.5" />
                        {t("actions.view")}
                      </Button>
                      {item.status !== "paid" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkPaid(item)}
                          disabled={markPaidMutation.isPending}
                        >
                          <CheckCircle2 className="size-3.5" />
                          {t("occurrences.actions.markPaid")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnmarkPaid(item)}
                          disabled={unmarkPaidMutation.isPending}
                        >
                          <RefreshCw className="size-3.5" />
                          {t("occurrences.actions.unmarkPaid")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOverrideAmount(item)}
                        disabled={overrideAmountMutation.isPending}
                      >
                        {t("occurrences.actions.overrideAmount")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </SectionCard>
    </AppPageContainer>
  );
}
