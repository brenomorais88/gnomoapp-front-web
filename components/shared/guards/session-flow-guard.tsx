"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import {
  resolveSessionFlow,
  SessionFlowMode,
} from "@/lib/routing/session-flow";
import { t } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useFamily } from "@/providers/family-provider";

type SessionFlowGuardProps = {
  mode: SessionFlowMode;
  children: ReactNode;
};

export function SessionFlowGuard({ mode, children }: SessionFlowGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const family = useFamily();

  const decision = resolveSessionFlow(mode, {
    isAuthLoading: auth.status === "idle" || auth.status === "loading",
    isAuthenticated: auth.isAuthenticated,
    isFamilyLoading: family.isLoading,
    familyStatus: family.status,
  });

  useEffect(() => {
    if (decision.type !== "redirect") {
      return;
    }

    if (decision.to === "/auth/login") {
      const nextPath = encodeURIComponent(pathname || "/");
      router.replace(`${decision.to}?next=${nextPath}`);
      return;
    }

    router.replace(decision.to);
  }, [decision, pathname, router]);

  if (decision.type === "loading") {
    return <LoadingState label={t("states.loading")} className="min-h-screen rounded-none border-0" />;
  }

  if (decision.type === "redirect") {
    return null;
  }

  return <>{children}</>;
}
