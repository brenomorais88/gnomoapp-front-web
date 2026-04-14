import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

export function SummaryCard({ label, value, hint, icon, className }: SummaryCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{hint}</p> : null}
    </article>
  );
}
