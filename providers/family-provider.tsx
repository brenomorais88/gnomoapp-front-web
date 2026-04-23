"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFamily, getMyFamily } from "@/features/families/api";
import { isNoFamilyForUserError } from "@/features/families/errors";
import { CreateFamilyInput } from "@/features/families/types";
import { useAuth } from "@/providers/auth-provider";
import { FamilySummaryDto } from "@/types/domain/families";

export type FamilyStatus = "idle" | "loading" | "ready" | "no-family" | "error";

type FamilyContextValue = {
  status: FamilyStatus;
  family: FamilySummaryDto | null;
  error: unknown;
  isLoading: boolean;
  isCreatingFamily: boolean;
  hasFamily: boolean;
  createFamily: (payload: CreateFamilyInput) => Promise<void>;
  revalidateFamily: () => Promise<void>;
  clearFamilyState: () => void;
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

type FamilyProviderProps = {
  children: ReactNode;
};

export function FamilyProvider({ children }: FamilyProviderProps) {
  const auth = useAuth();
  const [status, setStatus] = useState<FamilyStatus>("idle");
  const [family, setFamily] = useState<FamilySummaryDto | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);

  const clearFamilyState = useCallback(() => {
    setStatus("idle");
    setFamily(null);
    setError(null);
    setIsCreatingFamily(false);
  }, []);

  const revalidateFamily = useCallback(async () => {
    if (!auth.isAuthenticated) {
      clearFamilyState();
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await getMyFamily();
      setFamily(response);
      setStatus("ready");
    } catch (nextError) {
      if (isNoFamilyForUserError(nextError)) {
        setFamily(null);
        setStatus("no-family");
        return;
      }

      setFamily(null);
      setError(nextError);
      setStatus("error");
    }
  }, [auth.isAuthenticated, clearFamilyState]);

  const handleCreateFamily = useCallback(async (payload: CreateFamilyInput) => {
    setIsCreatingFamily(true);
    setError(null);

    try {
      const nextFamily = await createFamily(payload);
      setFamily(nextFamily);
      setStatus("ready");
    } catch (nextError) {
      setError(nextError);
      throw nextError;
    } finally {
      setIsCreatingFamily(false);
    }
  }, []);

  useEffect(() => {
    if (auth.status === "idle" || auth.status === "loading") {
      return;
    }

    if (!auth.isAuthenticated) {
      clearFamilyState();
      return;
    }

    revalidateFamily().catch(() => undefined);
  }, [auth.isAuthenticated, auth.status, clearFamilyState, revalidateFamily]);

  const contextValue = useMemo<FamilyContextValue>(
    () => ({
      status,
      family,
      error,
      isLoading: status === "loading",
      isCreatingFamily,
      hasFamily: status === "ready" && Boolean(family),
      createFamily: handleCreateFamily,
      revalidateFamily,
      clearFamilyState,
    }),
    [clearFamilyState, error, family, handleCreateFamily, isCreatingFamily, revalidateFamily, status],
  );

  return <FamilyContext.Provider value={contextValue}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const context = useContext(FamilyContext);

  if (!context) {
    throw new Error("useFamily must be used within FamilyProvider");
  }

  return context;
}
