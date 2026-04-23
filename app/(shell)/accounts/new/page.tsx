"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SectionCard } from "@/components/shared/data/section-card";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { AccountForm } from "@/features/accounts/components/account-form";
import { AccountFormValues } from "@/features/accounts/schema";
import { useCreateAccountMutation } from "@/features/accounts/hooks";
import { useAuthorization } from "@/hooks/auth/use-authorization";
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
    ownershipType: values.ownershipType,
    responsibleMemberId:
      values.ownershipType === "FAMILY" ? values.responsibleMemberId || undefined : undefined,
    notes: values.notes?.trim() || undefined,
    active: values.active,
  };
}

export default function NewAccountPage() {
  const router = useRouter();
  const authorization = useAuthorization();
  const createMutation = useCreateAccountMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCreate(values: AccountFormValues) {
    if (values.ownershipType === "FAMILY" && !authorization.canCreateFamilyAccount) {
      setErrorMessage(t("accounts.familyWriteBlocked"));
      return;
    }

    try {
      const account = await createMutation.mutateAsync(toPayload(values));
      router.push(`/accounts/${account.id}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t("accounts.loadErrorTitle")));
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("accounts.createTitle")}
        description={t("accounts.createDescription")}
        actions={
          <Link
            href="/accounts"
            className="ds-focus-ring inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t("accounts.backToAccounts")}
          </Link>
        }
      />

      <SectionCard title={t("accounts.form.sectionTitle")} description={t("accounts.form.sectionDescription")}>
        {errorMessage ? (
          <InlineFeedback tone="danger" message={errorMessage} className="mb-4" />
        ) : null}
        <AccountForm
          mode="create"
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push("/accounts")}
          onSubmit={handleCreate}
        />
      </SectionCard>
    </AppPageContainer>
  );
}
