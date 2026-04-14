import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SectionCard } from "@/components/shared/data/section-card";
import { ReactNode } from "react";
import { t } from "@/lib/i18n";

type FeaturePagePlaceholderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function FeaturePagePlaceholder({
  title,
  description,
  children,
}: FeaturePagePlaceholderProps) {
  return (
    <AppPageContainer className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title={t("states.moduleUnderConstruction")}
        description={t("states.moduleUnderConstructionDescription")}
      />
      <SectionCard
        title={t("states.noData")}
        description={t("states.moduleUnderConstructionDescription")}
      >
        {children ?? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Main data section
            </div>
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Side insights section
            </div>
          </div>
        )}
      </SectionCard>
    </AppPageContainer>
  );
}
