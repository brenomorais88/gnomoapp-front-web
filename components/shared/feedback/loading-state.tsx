import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = "Loading data...", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-36 items-center justify-center rounded-lg border border-border/40 bg-card p-6",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}
