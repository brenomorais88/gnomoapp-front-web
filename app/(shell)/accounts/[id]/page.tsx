"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { useAccountDetailQuery } from "@/features/accounts/hooks";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { useMyFamilyMembersQuery } from "@/features/families/hooks";
import { useAuthorization } from "@/hooks/auth/use-authorization";
import { getErrorMessage } from "@/lib/api/error";
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

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const accountId = params.id;
  const authorization = useAuthorization();

  const detailQuery = useAccountDetailQuery(accountId);
  const categoriesQuery = useCategoriesListQuery();
  const familyMembersQuery = useMyFamilyMembersQuery();

  const categoryName = categoriesQuery.data?.find((category) => category.id === detailQuery.data?.categoryId)?.name;
  const responsibleMemberName = familyMembersQuery.data?.find(
    (member) => member.id === detailQuery.data?.responsibleMemberId,
  )?.name;

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("accounts.detailTitle")}
        description={t("accounts.detailDescription")}
        actions={
          <div className="flex gap-2">
            <Link
              href="/accounts"
              className="ds-focus-ring inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t("actions.back")}
            </Link>
            <Link
              href={`/accounts/${accountId}/edit`}
              className={`ds-focus-ring inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                detailQuery.data?.ownershipType === "FAMILY" &&
                !authorization.canEditFamilyAccount
                  ? "pointer-events-none cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {t("accounts.editAccount")}
            </Link>
          </div>
        }
      />

      <SectionCard title={t("accounts.detailOverviewTitle")} description={t("accounts.detailOverviewDescription")}>
        {detailQuery.isLoading || familyMembersQuery.isLoading ? (
          <LoadingState label={t("accounts.loadingDetail")} />
        ) : detailQuery.isError || familyMembersQuery.isError ? (
          <ErrorState
            title={t("accounts.loadDetailErrorTitle")}
            description={getErrorMessage(detailQuery.error) || getErrorMessage(familyMembersQuery.error)}
            action={
              <Button variant="outline" onClick={() => detailQuery.refetch()}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : !detailQuery.data ? (
          <EmptyState
            title={t("accounts.notFound")}
            description={t("accounts.notFoundDescription")}
            action={
              <Button variant="outline" onClick={() => router.push("/accounts")}>
                {t("accounts.backToAccounts")}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.title")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{detailQuery.data.title}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.category")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{categoryName ?? t("common.unknown")}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.recurrence")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{t(`accounts.recurrence.${detailQuery.data.recurrenceType}`)}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.scope")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {t(`accounts.ownershipType.${detailQuery.data.ownershipType}`)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.baseAmount")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {currencyFormatter.format(Number(detailQuery.data.baseAmount ?? 0))}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.startDate")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatDate(detailQuery.data.startDate)}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.endDate")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatDate(detailQuery.data.endDate)}</p>
            </div>
            {detailQuery.data.ownershipType === "FAMILY" ? (
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("accounts.table.responsibleMember")}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {responsibleMemberName ?? t("common.notAvailable")}
                </p>
              </div>
            ) : null}
            <div className="rounded-lg border border-border p-4 sm:col-span-2 lg:col-span-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.form.notes")}</p>
              <p className="mt-1 text-sm text-foreground">{detailQuery.data.notes || t("common.notAvailable")}</p>
            </div>
            <div className="rounded-lg border border-border p-4 sm:col-span-2 lg:col-span-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("accounts.table.status")}</p>
              <div className="mt-2">
                <StatusBadge
                  label={detailQuery.data.active === false ? t("accounts.inactive") : t("accounts.active")}
                  tone={detailQuery.data.active === false ? "neutral" : "success"}
                />
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </AppPageContainer>
  );
}
