"use client";

import { useState } from "react";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SectionCard } from "@/components/shared/data/section-card";
import { Button } from "@/components/ui/button";
import { CreateFamilyForm } from "@/features/families/components/create-family-form";
import { CreateFamilyFormValues } from "@/features/families/schema";
import { getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";
import { useFamily } from "@/providers/family-provider";

export default function FamilyOnboardingPage() {
  const family = useFamily();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleCreateFamily(values: CreateFamilyFormValues) {
    setSubmitError(null);

    try {
      await family.createFamily(values);
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, t("onboarding.family.form.submitErrorFallback")),
      );
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("onboarding.family.title")}
        description={t("onboarding.family.description")}
      />
      <SectionCard
        title={t("onboarding.family.nextStepTitle")}
        description={t("onboarding.family.nextStepDescription")}
      >
        {family.status === "error" ? (
          <ErrorState
            title={t("onboarding.family.loadErrorTitle")}
            description={getErrorMessage(family.error)}
            action={
              <Button variant="outline" onClick={() => family.revalidateFamily()}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("onboarding.family.form.description")}
            </p>
            <CreateFamilyForm
              isSubmitting={family.isCreatingFamily}
              onSubmit={handleCreateFamily}
            />
            {submitError ? (
              <InlineFeedback tone="danger" message={submitError} />
            ) : null}
          </div>
        )}
      </SectionCard>
    </AppPageContainer>
  );
}
