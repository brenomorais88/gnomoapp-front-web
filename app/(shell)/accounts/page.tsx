"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Power, Trash2 } from "lucide-react";
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
import {
  useAccountsListQuery,
  useDeleteAccountMutation,
  useUpdateAccountMutation,
} from "@/features/accounts/hooks";
import { AccountDto } from "@/features/accounts/types";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(value?: string | null) {
  if (!value) {
    return t("common.notAvailable");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return t("accounts.deleteBlocked");
  }

  return getErrorMessage(error, t("accounts.loadErrorTitle"));
}

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "danger">("success");

  const accountsQuery = useAccountsListQuery();
  const categoriesQuery = useCategoriesListQuery();
  const updateMutation = useUpdateAccountMutation();
  const deleteMutation = useDeleteAccountMutation();

  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categoriesQuery.data]);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return accounts;
    }

    return accounts.filter((account) => {
      const categoryName = categoriesById.get(account.categoryId) ?? "";

      return (
        account.title.toLowerCase().includes(normalizedSearch) ||
        categoryName.toLowerCase().includes(normalizedSearch) ||
        account.recurrenceType.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [accounts, categoriesById, search]);

  async function handleToggleActive(account: AccountDto) {
    const nextActive = account.active === false;
    const confirmMessage = nextActive
      ? t("accounts.activateConfirm", { values: { title: account.title } })
      : t("accounts.deactivateConfirm", { values: { title: account.title } });

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: account.id,
        payload: { active: nextActive },
      });
      setFeedbackTone("success");
      setFeedback(nextActive ? t("accounts.activateSuccess") : t("accounts.deactivateSuccess"));
    } catch (error) {
      setFeedbackTone("danger");
      setFeedback(getErrorMessage(error, t("accounts.loadDetailErrorTitle")));
    }
  }

  async function handleDelete(account: AccountDto) {
    if (!window.confirm(t("accounts.deleteConfirm", { values: { title: account.title } }))) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(account.id);
      setFeedbackTone("success");
      setFeedback(t("accounts.deleteSuccess"));
    } catch (error) {
      setFeedbackTone("danger");
      setFeedback(getDeleteErrorMessage(error));
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("accounts.title")}
        description={t("accounts.description")}
        actions={
          <Link
            href="/accounts/new"
            className="ds-focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            {t("actions.newAccount")}
          </Link>
        }
      />

      {feedback ? (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            feedbackTone === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback}
        </div>
      ) : null}

      <Toolbar
        left={
          <input
            className="ds-focus-ring h-9 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder={t("accounts.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
      />

      <SectionCard title={t("accounts.listTitle")} description={t("accounts.listDescription")}>
        {accountsQuery.isLoading || categoriesQuery.isLoading ? (
          <LoadingState label={t("accounts.loadingList")} />
        ) : accountsQuery.isError ? (
          <ErrorState
            title={t("accounts.loadErrorTitle")}
            description={getErrorMessage(accountsQuery.error)}
            action={
              <Button variant="outline" onClick={() => accountsQuery.refetch()}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : categoriesQuery.isError ? (
          <ErrorState
            title={t("accounts.loadCategoriesErrorTitle")}
            description={getErrorMessage(categoriesQuery.error)}
            action={
              <Button variant="outline" onClick={() => categoriesQuery.refetch()}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : filteredAccounts.length === 0 ? (
          <EmptyState
            title={accounts.length === 0 ? t("accounts.noAccounts") : t("states.noResults")}
            description={
              accounts.length === 0
                ? t("accounts.noAccountsDescription")
                : t("accounts.noResultsDescription")
            }
            action={
              accounts.length === 0 ? (
                <Link
                  href="/accounts/new"
                  className="ds-focus-ring inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {t("actions.createAccount")}
                </Link>
              ) : undefined
            }
          />
        ) : (
          <DataTable>
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("accounts.table.title")}</th>
                <th className="px-4 py-3 font-medium">{t("accounts.table.category")}</th>
                <th className="px-4 py-3 font-medium">{t("accounts.table.recurrence")}</th>
                <th className="px-4 py-3 font-medium">{t("accounts.table.baseAmount")}</th>
                <th className="px-4 py-3 font-medium">{t("accounts.table.startDate")}</th>
                <th className="px-4 py-3 font-medium">{t("accounts.table.endDate")}</th>
                <th className="px-4 py-3 font-medium">{t("accounts.table.status")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("accounts.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">{account.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {categoriesById.get(account.categoryId) ?? t("common.unknown")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t(`accounts.recurrence.${account.recurrenceType}`)}</td>
                  <td className="px-4 py-3 text-foreground">
                    {currencyFormatter.format(account.baseAmount ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(account.startDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(account.endDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={account.active === false ? t("accounts.inactive") : t("accounts.active")}
                      tone={account.active === false ? "neutral" : "success"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/accounts/${account.id}`}
                        className="ds-focus-ring inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <Eye className="size-3.5" />
                        {t("actions.view")}
                      </Link>
                      <Link
                        href={`/accounts/${account.id}/edit`}
                        className="ds-focus-ring inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <Pencil className="size-3.5" />
                        {t("actions.edit")}
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(account)}
                        disabled={updateMutation.isPending}
                      >
                        <Power className="size-3.5" />
                        {account.active === false ? t("actions.activate") : t("actions.deactivate")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(account)}
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
