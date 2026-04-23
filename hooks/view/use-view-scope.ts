"use client";

import { useMemo } from "react";
import { ViewScope } from "@/features/view-context/types";
import { t } from "@/lib/i18n";
import { useViewScopeContext } from "@/providers/view-scope-provider";

export function useViewScope() {
  const context = useViewScopeContext();

  const label = useMemo(() => getViewScopeLabel(context.scope), [context.scope]);

  return {
    scope: context.scope,
    setScope: context.setScope,
    label,
  };
}

export function getViewScopeLabel(scope: ViewScope) {
  switch (scope) {
    case "PERSONAL":
      return t("viewScope.personal");
    case "FAMILY":
      return t("viewScope.family");
    default:
      return t("viewScope.visibleToMe");
  }
}
