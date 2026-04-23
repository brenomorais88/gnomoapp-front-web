"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { GlobalNetworkActivity } from "@/components/shared/feedback/global-network-activity";
import { reportGlobalError } from "@/lib/api/error-reporter";
import { AuthProvider } from "@/providers/auth-provider";
import { FamilyProvider } from "@/providers/family-provider";
import { GlobalFeedbackProvider } from "@/providers/global-feedback-provider";
import { ViewScopeProvider } from "@/providers/view-scope-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: reportGlobalError,
        }),
        mutationCache: new MutationCache({
          onError: reportGlobalError,
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalFeedbackProvider>
        <AuthProvider>
          <FamilyProvider>
            <ViewScopeProvider>
              {children}
              <GlobalNetworkActivity />
            </ViewScopeProvider>
          </FamilyProvider>
        </AuthProvider>
      </GlobalFeedbackProvider>
    </QueryClientProvider>
  );
}
