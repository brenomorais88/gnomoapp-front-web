"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/error";
import { setGlobalErrorReporter } from "@/lib/api/error-reporter";
import { t } from "@/lib/i18n";

type GlobalFeedbackContextValue = {
  notifyError: (error: unknown) => void;
  clearError: () => void;
};

const GlobalFeedbackContext = createContext<GlobalFeedbackContextValue | null>(null);

type GlobalFeedbackProviderProps = {
  children: ReactNode;
};

export function GlobalFeedbackProvider({ children }: GlobalFeedbackProviderProps) {
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setGlobalErrorMessage(null);
  }, []);

  const notifyError = useCallback((error: unknown) => {
    setGlobalErrorMessage(getErrorMessage(error));
  }, []);

  const contextValue = useMemo<GlobalFeedbackContextValue>(
    () => ({
      notifyError,
      clearError,
    }),
    [clearError, notifyError],
  );

  useEffect(() => {
    setGlobalErrorReporter(notifyError);
    return () => setGlobalErrorReporter(null);
  }, [notifyError]);

  return (
    <GlobalFeedbackContext.Provider value={contextValue}>
      {children}
      {globalErrorMessage ? (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-destructive/30 bg-background p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{globalErrorMessage}</p>
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={clearError}>
              {t("actions.close")}
            </Button>
          </div>
        </div>
      ) : null}
    </GlobalFeedbackContext.Provider>
  );
}

export function useGlobalFeedback() {
  const context = useContext(GlobalFeedbackContext);

  if (!context) {
    throw new Error("useGlobalFeedback must be used within GlobalFeedbackProvider");
  }

  return context;
}
