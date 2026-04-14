import type { StatusTone } from "@/lib/design/tokens";
import { statusToneClassMap } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

export function StatusBadge({ label, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        statusToneClassMap[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
