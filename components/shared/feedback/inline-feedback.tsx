import { ReactNode } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type InlineFeedbackTone = "success" | "danger" | "info";

type InlineFeedbackProps = {
  tone: InlineFeedbackTone;
  message: ReactNode;
  className?: string;
};

const toneClasses: Record<InlineFeedbackTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-primary/30 bg-primary/10 text-primary",
};

export function InlineFeedback({ tone, message, className }: InlineFeedbackProps) {
  const isDanger = tone === "danger";

  return (
    <div
      role={isDanger ? "alert" : "status"}
      aria-live={isDanger ? "assertive" : "polite"}
      className={cn("rounded-lg border px-3 py-2 text-sm", toneClasses[tone], className)}
    >
      <div className="flex items-start gap-2">
        {tone === "success" ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : tone === "danger" ? (
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : null}
        <span>{message}</span>
      </div>
    </div>
  );
}
