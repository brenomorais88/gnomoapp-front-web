"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Power, Trash2 } from "lucide-react";
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
import {
  useActivateAccountMutation,
  useAccountsListQuery,
  useDeactivateAccountMutation,
  useDeleteAccountMutation,
} from "@/features/accounts/hooks";
import { AccountDto } from "@/features/accounts/types";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { useAuthorization } from "@/hooks/auth/use-authorization";
import { t } from "@/lib/i18n";
import { useMyFamilyMembersQuery } from "@/features/families/hooks";
import { useViewScope } from "@/hooks/view/use-view-scope";

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
  const authorization = useAuthorization();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "danger">("success");
  const { scope: scopeFilter, setScope: setScopeFilter, label: scopeLabel } = useViewScope();

  const accountsQuery = useAccountsListQuery({ scope: scopeFilter });
  const categoriesQuery = useCategoriesListQuery();
  const familyMembersQuery = useMyFamilyMembersQuery();
  const activateMutation = useActivateAccountMutation();
  const deactivateMutation = useDeactivateAccountMutation();
  const deleteMutation = useDeleteAccountMutation();

  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categoriesQuery.data]);
  const membersById = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of familyMembersQuery.data ?? []) {
      map.set(member.id, member.name);
    }
    return map;
  }, [familyMembersQuery.data]);

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
        account.recurrenceType.toLowerCase().includes(normalizedSearch) ||
        account.ownershipType.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [accounts, categoriesById, search]);

  async function handleToggleActive(account: AccountDto) {
    const canManageFamilyAccount =
      account.ownershipType !== "FAMILY" ||
      authorization.canEditFamilyAccount ||
      authorization.canMarkFamilyAccountPaid;
    if (!canManageFamilyAccount) {
      setFeedbackTone("danger");
      setFeedback(t("accounts.familyWriteBlocked"));
      return;
    }

    const nextActive = account.active === false;
    const confirmMessage = nextActive
      ? t("accounts.activateConfirm", { values: { title: account.title } })
      : t("accounts.deactivateConfirm", { values: { title: account.title } });

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (nextActive) {
        await activateMutation.mutateAsync(account.id);
      } else {
        await deactivateMutation.mutateAsync(account.id);
      }
      setFeedbackTone("success");
      setFeedback(nextActive ? t("accounts.activateSuccess") : t("accounts.deactivateSuccess"));
    } catch (error) {
      setFeedbackTone("danger");
      setFeedback(getErrorMessage(error, t("accounts.loadDetailErrorTitle")));
    }
  }

  async function handleDelete(account: AccountDto) {
    if (account.ownershipType === "FAMILY" && !authorization.canDeleteFamilyAccount) {
      setFeedbackTone("danger");
      setFeedback(t("accounts.familyWriteBlocked"));
      return;
    }

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
        <InlineFeedback
          tone={feedbackTone}
          message={feedback}
        />
      ) : null}

      <SectionCard
        title={t("viewScope.currentContextTitle")}
        description={t("viewScope.currentContextDescription", { values: { context: scopeLabel } })}
      >
        <ViewScopeSelector value={scopeFilter} onChange={setScopeFilter} />
      </SectionCard>

      <Toolbar
        left={
          <div className="flex flex-wrap gap-2">
            <input
              className="ds-focus-ring h-9 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder={t("accounts.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        }
      />

      <SectionCard title={t("accounts.listTitle")} description={t("accounts.listDescription")}>
        {accountsQuery.isLoading || categoriesQuery.isLoading || familyMembersQuery.isLoading ? (
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
        ) : categoriesQuery.isError || familyMembersQuery.isError ? (
          <ErrorState
            title={t("accounts.loadCategoriesErrorTitle")}
            description={getErrorMessage(categoriesQuery.error) || getErrorMessage(familyMembersQuery.error)}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  categoriesQuery.refetch();
                  familyMembersQuery.refetch();
                }}
              >
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
                <th className="px-4 py-3 font-medium">{t("accounts.table.scope")}</th>
                <th className="px-4 py-3 font-medium">{t("accounts.table.responsibleMember")}</th>
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
                    {currencyFormatter.format(Number(account.baseAmount ?? 0))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(account.startDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(account.endDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={t(`accounts.ownershipType.${account.ownershipType}`)}
                      tone={account.ownershipType === "FAMILY" ? "warning" : "info"}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {account.ownershipType === "FAMILY"
                      ? membersById.get(account.responsibleMemberId ?? "") ??
                        t("common.notAvailable")
                      : t("accounts.notApplicable")}
                  </td>
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
                        className={`ds-focus-ring inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                          account.ownershipType === "FAMILY" &&
                          !authorization.canEditFamilyAccount
                            ? "cursor-not-allowed border-border/60 text-muted-foreground pointer-events-none"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        <Pencil className="size-3.5" />
                        {t("actions.edit")}
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(account)}
                        disabled={activateMutation.isPending || deactivateMutation.isPending}
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
