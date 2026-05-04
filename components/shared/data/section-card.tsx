import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Tighter padding and header for dense layouts */
  dense?: boolean;
};

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  dense = false,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-gray-100 bg-card shadow-sm",
        dense ? "p-3 sm:p-4" : "p-4 sm:p-6",
        className,
      )}
    >
      {title || description || action ? (
        <div
          className={cn(
            "flex flex-col border-b border-border/50 sm:flex-row sm:items-start sm:justify-between",
            dense ? "mb-3 gap-2 pb-3" : "mb-4 gap-3 pb-4",
          )}
        >
          <div className={cn(dense ? "space-y-0.5" : "space-y-1")}>
            {title ? (
              <h2
                className={cn(
                  "font-semibold text-card-foreground",
                  dense ? "text-sm sm:text-base" : "text-base sm:text-lg",
                )}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                className={cn(
                  "text-muted-foreground",
                  dense ? "text-xs sm:text-sm" : "text-sm",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
