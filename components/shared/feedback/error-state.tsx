import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content right now. Please try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/8 p-6 sm:p-7",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <AlertTriangle className="mt-0.5 size-6 text-destructive shrink-0" aria-hidden="true" />
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
