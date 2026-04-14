import { ReactNode } from "react";
import { appShellSpacing } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

type AppPageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function AppPageContainer({ children, className }: AppPageContainerProps) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl", appShellSpacing, className)}>
      {children}
    </main>
  );
}
