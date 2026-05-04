"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import {
  DEFAULT_VIEW_SCOPE,
  loadStoredViewScope,
  saveStoredViewScope,
} from "@/features/view-context/storage";
import { ViewScope } from "@/features/view-context/types";

type ViewScopeContextValue = {
  scope: ViewScope;
  setScope: (scope: ViewScope) => void;
};

const ViewScopeContext = createContext<ViewScopeContextValue | null>(null);

type ViewScopeProviderProps = {
  children: ReactNode;
};

export function ViewScopeProvider({ children }: ViewScopeProviderProps) {
  const [scope, setScopeState] = useState<ViewScope>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_VIEW_SCOPE;
    }
    return loadStoredViewScope(window.localStorage);
  });

  const setScope = useCallback((nextScope: ViewScope) => {
    setScopeState(nextScope);

    if (typeof window !== "undefined") {
      saveStoredViewScope(window.localStorage, nextScope);
    }
  }, []);

  const value = useMemo(
    () => ({
      scope,
      setScope,
    }),
    [scope, setScope],
  );

  return <ViewScopeContext.Provider value={value}>{children}</ViewScopeContext.Provider>;
}

export function useViewScopeContext() {
  const context = useContext(ViewScopeContext);

  if (!context) {
    throw new Error("useViewScopeContext must be used within ViewScopeProvider.");
  }

  return context;
}
