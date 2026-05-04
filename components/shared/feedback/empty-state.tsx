import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border/50 bg-muted/30 p-8 text-center sm:p-10",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mx-auto mt-2.5 max-w-xl text-base text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
