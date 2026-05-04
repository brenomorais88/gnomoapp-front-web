"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { t } from "@/lib/i18n";

export function FinancialDashboardSearchBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  if (pathname !== "/financial-dashboard") {
    return null;
  }

  return (
    <div className="border-t border-border/60 bg-background/80 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-3xl">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          className="ds-focus-ring h-10 w-full rounded-2xl border border-input bg-muted/50 py-2 pl-10 pr-3 text-sm text-foreground shadow-inner placeholder:text-muted-foreground"
          placeholder={t("financeDashboard.searchPlaceholder")}
          value={q}
          onChange={(event) => {
            const params = new URLSearchParams(searchParams.toString());
            const value = event.target.value;
            if (value) {
              params.set("q", value);
            } else {
              params.delete("q");
            }
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
          }}
          aria-label={t("financeDashboard.searchPlaceholder")}
        />
      </div>
    </div>
  );
}
