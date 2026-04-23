"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { appNavigationItems, getRouteLabelKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { t } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useViewScope } from "@/hooks/view/use-view-scope";

type AppShellProps = {
  children: ReactNode;
};

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {appNavigationItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "ds-focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const { label: scopeLabel } = useViewScope();

  const routeTitle = useMemo(() => getRouteLabelKey(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-surface/80 p-5 lg:flex lg:flex-col">
          <div className="mb-6 border-b border-border/70 pb-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("common.appName")}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {t("common.billManagement")}
            </h2>
          </div>
          <NavigationContent />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label={t("navigation.openMenu")}
                >
                  <Menu className="size-4" />
                </Button>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t(routeTitle)}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{t("common.workflowSubtitle")}</p>
                    <StatusBadge label={scopeLabel} tone="info" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="hidden text-sm text-muted-foreground sm:block">
                  {session?.user.name || session?.user.email}
                </p>
                <Button size="sm" variant="outline" onClick={logout}>
                  {t("auth.actions.logout")}
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </div>
      </div>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/25"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label={t("navigation.closeMenu")}
          />
          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-xs border-r border-border bg-surface p-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("common.appName")}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {t("navigation.menu")}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMobileNavOpen(false)}
              >
                {t("actions.close")}
              </Button>
            </div>
            <NavigationContent onNavigate={() => setIsMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
