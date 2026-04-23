"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { t } from "@/lib/i18n";

export function GlobalNetworkActivity() {
  const activeQueries = useIsFetching();
  const activeMutations = useIsMutating();
  const isBusy = activeQueries + activeMutations > 0;

  if (!isBusy) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="h-0.5 w-full animate-pulse bg-primary" />
      <div className="mx-auto mt-2 w-fit rounded-full border border-border bg-background/95 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
        {t("states.loading")}
      </div>
    </div>
  );
}
