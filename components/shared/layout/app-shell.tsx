"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { appNavigationMenuItems, financeNavigationItems, getRouteLabelKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useFamily } from "@/providers/family-provider";

type AppShellProps = {
  children: ReactNode;
};

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isFinanceActive = financeNavigationItems.some((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const [isFinanceOpen, setIsFinanceOpen] = useState(isFinanceActive);

  useEffect(() => {
    if (isFinanceActive) {
      setIsFinanceOpen(true);
    }
  }, [isFinanceActive]);

  return (
    <nav className="space-y-0.5">
      {appNavigationMenuItems.map((item) => {
        const Icon = item.icon;
        if ("children" in item) {
          return (
            <div key={item.labelKey}>
              <button
                type="button"
                onClick={() => setIsFinanceOpen((current) => !current)}
                className={cn(
                  "ds-focus-ring flex w-full items-center gap-2.5 rounded-lg border-l-4 py-2.5 pl-3 pr-3 text-sm font-medium transition-all duration-200",
                  isFinanceActive
                    ? "gnomo-nav-active border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
                aria-expanded={isFinanceOpen}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-left">{t(item.labelKey)}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    isFinanceOpen ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden="true"
                />
              </button>
              {isFinanceOpen ? (
                <div className="mt-1 space-y-1 pl-6">
                  {item.children.map((subItem) => {
                    const isSubItemActive =
                      pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={onNavigate}
                        className={cn(
                          "ds-focus-ring flex items-center gap-3 rounded-lg border-l-4 py-2 pl-3 pr-3 text-sm font-medium transition-all duration-200",
                          isSubItemActive
                            ? "gnomo-nav-active border-secondary text-secondary"
                            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        <subItem.icon
                          className={cn("size-4", isSubItemActive && "size-[1.15rem]")}
                          aria-hidden="true"
                        />
                        <span>{t(subItem.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        }

        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "ds-focus-ring flex items-center gap-2.5 rounded-lg border-l-4 py-2.5 pl-3 pr-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "gnomo-nav-active border-primary text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Icon
              className={cn("size-4 shrink-0", isActive && "size-[1.15rem]")}
              aria-hidden="true"
            />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const auth = useAuth();
  const family = useFamily();
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const routeTitle = useMemo(() => getRouteLabelKey(pathname), [pathname]);
  const userDisplayName = auth.session?.user.name || auth.session?.user.email || "";
  const userInitials = useMemo(() => {
    const source = userDisplayName.trim();
    if (!source) {
      return "U";
    }

    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [userDisplayName]);

  const familyOptions = useMemo(() => {
    const sessionFamilies = auth.session?.families ?? [];
    if (sessionFamilies.length > 0) {
      return sessionFamilies;
    }

    if (family.family) {
      return [family.family];
    }

    return [];
  }, [auth.session?.families, family.family]);

  const activeFamilyId =
    auth.session?.activeFamilyId ??
    family.family?.id ??
    familyOptions[0]?.id ??
    "";

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current) {
        return;
      }

      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 w-full border-b border-primary/10 bg-gradient-to-br from-primary/5 via-secondary/3 to-background shadow-sm backdrop-blur-lg">
          <div className="grid h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center shrink-0">
                <img
                  src="/gnomo_logo_assets/svg/compact-purple.svg"
                  alt="Gnomo"
                  className="h-10 w-auto"
                />
              </div>

              <div className="hidden h-full min-w-[220px] max-w-[380px] items-center justify-center justify-self-center sm:flex">
                {familyOptions.length > 1 ? (
                  <select
                    value={activeFamilyId}
                    onChange={(event) => auth.setActiveFamilyId(event.target.value)}
                    className="ds-focus-ring h-10 w-full rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 px-3 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:shadow-md shadow-sm"
                    aria-label={t("navigation.currentFamily")}
                  >
                    {familyOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-primary/25 bg-gradient-to-r from-primary/10 to-secondary/8 px-5 py-2.5 text-center text-sm font-bold text-foreground shadow-sm">
                    {family.family?.name ?? t("navigation.noFamilySelected")}
                  </div>
                )}
              </div>

              <div className="flex h-full items-center justify-end gap-4" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className="ds-focus-ring flex size-11 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/15 to-secondary/12 text-sm font-bold text-foreground transition-all hover:from-primary/25 hover:to-secondary/20 hover:shadow-md shadow-sm"
                  aria-label={t("navigation.userMenu")}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                >
                  {userInitials}
                </button>
                {isUserMenuOpen ? (
                  <div className="absolute right-4 top-24 z-50 w-44 rounded-lg border border-border/40 bg-card p-1.5 shadow-lg sm:right-6 lg:right-8">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="ds-focus-ring block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {t("navigation.myProfile")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        auth.logout();
                      }}
                      className="ds-focus-ring mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      {t("auth.actions.logout")}
                    </button>
                  </div>
                ) : null}
              </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[17rem] shrink-0 border-r border-primary/10 bg-gradient-to-b from-primary/4 via-secondary/2 to-primary/3 px-4 py-5 lg:flex lg:flex-col">
            <NavigationContent />
          </aside>

          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="min-h-full">{children}</div>
          </div>
        </div>

        <footer className="w-full border-t border-primary/10 bg-gradient-to-b from-primary/4 via-secondary/2 to-primary/3 px-4 py-9 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              <a href="#" className="transition-colors hover:text-primary">
                {t("navigation.footer.contact")}
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                {t("navigation.footer.terms")}
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                {t("navigation.footer.privacy")}
              </a>
            </div>
            <span className="text-xs font-medium">{t("navigation.footer.cnpj")}</span>
          </div>
        </footer>
      </div>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/25"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label={t("navigation.closeMenu")}
          />
          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-xs border-r border-primary/10 bg-gradient-to-b from-primary/4 via-secondary/2 to-primary/3 p-4 shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-border/30 pb-3">
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
