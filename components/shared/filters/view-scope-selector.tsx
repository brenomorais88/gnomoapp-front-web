"use client";

import { ViewScope } from "@/features/view-context/types";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const scopeOptions: { value: ViewScope; label: string }[] = [
  { value: "VISIBLE_TO_ME", label: t("viewScope.visibleToMe") },
  { value: "PERSONAL", label: t("viewScope.personal") },
  { value: "FAMILY", label: t("viewScope.family") },
];

type ViewScopeSelectorProps = {
  value: ViewScope;
  onChange: (scope: ViewScope) => void;
  className?: string;
};

export function ViewScopeSelector({ value, onChange, className }: ViewScopeSelectorProps) {
  return (
    <div className={cn("inline-flex rounded-lg border border-border bg-muted/50 p-1", className)}>
      {scopeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "ds-focus-ring rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
