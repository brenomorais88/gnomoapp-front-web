"use client";

import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { SectionCard } from "@/components/shared/data/section-card";
import { useAuth } from "@/providers/auth-provider";
import { t } from "@/lib/i18n";

export default function ProfilePage() {
  const auth = useAuth();
  const user = auth.session?.user;

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader title={t("navigation.profile")} description={t("profile.description")} />

      <SectionCard title={t("profile.accountTitle")} description={t("profile.accountDescription")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 px-3 py-2">
            <p className="text-xs text-muted-foreground">{t("profile.name")}</p>
            <p className="text-sm font-medium text-foreground">{user?.name || t("common.notAvailable")}</p>
          </div>
          <div className="rounded-lg border border-border/70 px-3 py-2">
            <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
            <p className="text-sm font-medium text-foreground">{user?.email || t("common.notAvailable")}</p>
          </div>
        </div>
      </SectionCard>
    </AppPageContainer>
  );
}
