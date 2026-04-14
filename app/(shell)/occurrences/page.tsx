"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data/data-table";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { Toolbar } from "@/components/shared/data/toolbar";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAccountsListQuery } from "@/features/accounts/hooks";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { OccurrenceForm } from "@/features/occurrences/components/occurrence-form";
import {
  useCreateOccurrenceMutation,
  useDeleteOccurrenceMutation,
  useOccurrenceDetailQuery,
  useOccurrencesListQuery,
  useUpdateOccurrenceMutation,
} from "@/features/occurrences/hooks";
import { OccurrenceFormValues } from "@/features/occurrences/schema";
import { OccurrenceDto, OccurrenceStatus } from "@/features/occurrences/types";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";

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

function toPayload(values: OccurrenceFormValues) {
  return {
    description: values.description.trim(),
    amount: values.amount,
    dueDate: values.dueDate,
    accountId: values.accountId || undefined,
    categoryId: values.categoryId || undefined,
    status: values.status,
  };
}

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

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return t("occurrences.deleteBlocked");
  }

  return getErrorMessage(error, t("occurrences.loadErrorTitle"));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

export default function OccurrencesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OccurrenceStatus>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOccurrenceId, setEditingOccurrenceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const occurrencesQuery = useOccurrencesListQuery();
  const categoriesQuery = useCategoriesListQuery({ size: 300 });
  const accountsQuery = useAccountsListQuery({ size: 300 });
  const createMutation = useCreateOccurrenceMutation();
  const updateMutation = useUpdateOccurrenceMutation();
  const deleteMutation = useDeleteOccurrenceMutation();
  const editingOccurrenceQuery = useOccurrenceDetailQuery(editingOccurrenceId ?? "");

  const occurrences = useMemo(() => occurrencesQuery.data ?? [], [occurrencesQuery.data]);

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

  const filteredOccurrences = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return occurrences.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const accountTitle = item.accountId ? accountsById.get(item.accountId) ?? "" : "";
      const categoryName = item.categoryId ? categoriesById.get(item.categoryId) ?? "" : "";

      return (
        item.description.toLowerCase().includes(normalizedSearch) ||
        accountTitle.toLowerCase().includes(normalizedSearch) ||
        categoryName.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [accountsById, categoriesById, occurrences, search, statusFilter]);

  const isBaseLoading =
    occurrencesQuery.isLoading || categoriesQuery.isLoading || accountsQuery.isLoading;
  const baseError =
    occurrencesQuery.error ?? categoriesQuery.error ?? accountsQuery.error;

  async function handleCreate(values: OccurrenceFormValues) {
    try {
      await createMutation.mutateAsync(toPayload(values));
      setFeedback({ tone: "success", message: t("occurrences.createSuccess") });
      setIsCreateOpen(false);
    } catch (error) {
      setFeedback({ tone: "danger", message: getErrorMessage(error, t("occurrences.loadErrorTitle")) });
    }
  }

  async function handleEdit(values: OccurrenceFormValues) {
    if (!editingOccurrenceId) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingOccurrenceId,
        payload: toPayload(values),
      });
      setFeedback({ tone: "success", message: t("occurrences.updateSuccess") });
      setEditingOccurrenceId(null);
    } catch (error) {
      setFeedback({ tone: "danger", message: getErrorMessage(error, t("occurrences.loadDetailErrorTitle")) });
    }
  }

  async function handleDelete(item: OccurrenceDto) {
    if (!window.confirm(t("occurrences.deleteConfirm", { values: { description: item.description } }))) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(item.id);
      setFeedback({ tone: "success", message: t("occurrences.deleteSuccess") });
    } catch (error) {
      setFeedback({ tone: "danger", message: getDeleteErrorMessage(error) });
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("occurrences.title")}
        description={t("occurrences.description")}
      />

      {feedback ? (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            feedback.tone === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <Toolbar
        left={
          <>
            <input
              className="ds-focus-ring h-9 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder={t("occurrences.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="ds-focus-ring h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | OccurrenceStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        }
        right={
          <Button
            onClick={() => {
              setIsCreateOpen(true);
              setEditingOccurrenceId(null);
              setFeedback(null);
            }}
          >
            <Plus className="size-4" />
            {t("actions.newOccurrence")}
          </Button>
        }
      />

      {isCreateOpen ? (
        <SectionCard title={t("occurrences.createTitle")} description={t("occurrences.createDescription")}>
          <OccurrenceForm
            mode="create"
            isSubmitting={createMutation.isPending}
            onCancel={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
          />
        </SectionCard>
      ) : null}

      {editingOccurrenceId ? (
        <SectionCard title={t("occurrences.editTitle")} description={t("occurrences.editDescription")}>
          {editingOccurrenceQuery.isLoading ? (
            <LoadingState label={t("occurrences.loadingDetail")} />
          ) : editingOccurrenceQuery.isError ? (
            <ErrorState
              title={t("occurrences.loadDetailErrorTitle")}
              description={getErrorMessage(editingOccurrenceQuery.error)}
              action={
                <Button variant="outline" onClick={() => setEditingOccurrenceId(null)}>
                  {t("actions.close")}
                </Button>
              }
            />
          ) : (
            <OccurrenceForm
              mode="edit"
              isSubmitting={updateMutation.isPending}
              initialValues={{
                description: editingOccurrenceQuery.data?.description ?? "",
                amount: editingOccurrenceQuery.data?.amount ?? 0,
                dueDate: editingOccurrenceQuery.data?.dueDate ?? "",
                accountId: editingOccurrenceQuery.data?.accountId ?? "",
                categoryId: editingOccurrenceQuery.data?.categoryId ?? "",
                status: editingOccurrenceQuery.data?.status ?? "pending",
              }}
              onCancel={() => setEditingOccurrenceId(null)}
              onSubmit={handleEdit}
            />
          )}
        </SectionCard>
      ) : null}

      <SectionCard title={t("occurrences.listTitle")} description={t("occurrences.listDescription")}>
        {isBaseLoading ? (
          <LoadingState label={t("occurrences.loadingList")} />
        ) : baseError ? (
          <ErrorState
            title={t("occurrences.loadErrorTitle")}
            description={getErrorMessage(baseError)}
            action={
              <Button variant="outline" onClick={() => {
                occurrencesQuery.refetch();
                categoriesQuery.refetch();
                accountsQuery.refetch();
              }}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : filteredOccurrences.length === 0 ? (
          <EmptyState
            title={occurrences.length === 0 ? t("occurrences.noOccurrences") : t("states.noResults")}
            description={
              occurrences.length === 0
                ? t("occurrences.noOccurrencesDescription")
                : t("occurrences.noResultsDescription")
            }
            action={
              occurrences.length === 0 ? (
                <Button onClick={() => setIsCreateOpen(true)}>{t("actions.createOccurrence")}</Button>
              ) : undefined
            }
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
              {filteredOccurrences.map((item) => (
                <tr key={item.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">{item.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.accountId ? accountsById.get(item.accountId) ?? t("common.unknown") : t("common.notAvailable")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.categoryId ? categoriesById.get(item.categoryId) ?? t("common.unknown") : t("common.notAvailable")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-3 text-foreground">{currencyFormatter.format(item.amount ?? 0)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={
                        item.status ? t(`occurrences.statusFilter.${item.status}`) : t("common.unknown")
                      }
                      tone={getStatusTone(item.status)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingOccurrenceId(item.id);
                          setIsCreateOpen(false);
                          setFeedback(null);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        {t("actions.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="size-3.5" />
                        {t("actions.delete")}
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
