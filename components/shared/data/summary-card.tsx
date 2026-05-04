import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
  /** Tighter padding and typography for dense dashboards */
  dense?: boolean;
};

export function SummaryCard({
  label,
  value,
  hint,
  icon,
  className,
  dense = false,
}: SummaryCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-gray-100 bg-card shadow-sm",
        dense ? "p-3 sm:p-4" : "p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <p className="text-sm font-normal text-muted-foreground">{label}</p>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <p
        className={cn(
          "font-semibold tracking-tight text-card-foreground",
          dense
            ? "mt-2 text-xl sm:text-2xl"
            : "mt-3 text-2xl sm:text-3xl",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "text-muted-foreground",
            dense ? "mt-1.5 text-xs" : "mt-2 text-xs sm:text-sm",
          )}
        >
          {hint}
        </p>
      ) : null}
    </article>
  );
}
