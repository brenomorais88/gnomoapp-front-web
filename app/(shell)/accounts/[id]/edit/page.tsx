"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { SectionCard } from "@/components/shared/data/section-card";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { AccountForm } from "@/features/accounts/components/account-form";
import { useAccountDetailQuery, useUpdateAccountMutation } from "@/features/accounts/hooks";
import { AccountFormValues } from "@/features/accounts/schema";
import { getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";

function toPayload(values: AccountFormValues) {
  return {
    title: values.title.trim(),
    baseAmount: values.baseAmount,
    startDate: values.startDate,
    endDate: values.endDate || null,
    recurrenceType: values.recurrenceType,
    categoryId: values.categoryId,
    notes: values.notes?.trim() || undefined,
    active: values.active,
  };
}

export default function EditAccountPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const accountId = params.id;

  const detailQuery = useAccountDetailQuery(accountId);
  const updateMutation = useUpdateAccountMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const accountData = detailQuery.data;

  async function handleUpdate(values: AccountFormValues) {
    try {
      await updateMutation.mutateAsync({
        id: accountId,
        payload: toPayload(values),
      });
      router.push(`/accounts/${accountId}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t("accounts.loadDetailErrorTitle")));
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("accounts.editTitle")}
        description={t("accounts.editDescription")}
        actions={
          <Link
            href={`/accounts/${accountId}`}
            className="ds-focus-ring inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t("accounts.backToDetails")}
          </Link>
        }
      />

      <SectionCard title={t("accounts.form.sectionTitle")} description={t("accounts.form.sectionDescription")}>
        {detailQuery.isLoading ? (
          <LoadingState label={t("accounts.loadingDetail")} />
        ) : detailQuery.isError ? (
          <ErrorState
            title={t("accounts.loadDetailErrorTitle")}
            description={getErrorMessage(detailQuery.error)}
            action={
              <Button variant="outline" onClick={() => detailQuery.refetch()}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : !accountData ? (
          <ErrorState
            title={t("accounts.notFound")}
            description={t("accounts.notFoundDescription")}
          />
        ) : (
          <>
            {errorMessage ? (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
            <AccountForm
              mode="edit"
              isSubmitting={updateMutation.isPending}
              initialValues={{
                title: accountData.title,
                baseAmount: accountData.baseAmount,
                startDate: accountData.startDate,
                endDate: accountData.endDate || "",
                recurrenceType: accountData.recurrenceType,
                categoryId: accountData.categoryId,
                notes: accountData.notes || "",
                active: accountData.active ?? true,
              }}
              onCancel={() => router.push(`/accounts/${accountId}`)}
              onSubmit={handleUpdate}
            />
          </>
        )}
      </SectionCard>
    </AppPageContainer>
  );
}
