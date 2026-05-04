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
  success: "border-success/40 bg-success/12 text-success",
  danger: "border-destructive/40 bg-destructive/12 text-destructive",
  info: "border-primary/40 bg-primary/12 text-primary",
};

export function InlineFeedback({ tone, message, className }: InlineFeedbackProps) {
  const isDanger = tone === "danger";

  return (
    <div
      role={isDanger ? "alert" : "status"}
      aria-live={isDanger ? "assertive" : "polite"}
      className={cn("rounded-lg border px-4 py-3 text-sm font-medium", toneClasses[tone], className)}
    >
      <div className="flex items-start gap-3">
        {tone === "success" ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        ) : tone === "danger" ? (
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        ) : null}
        <span>{message}</span>
      </div>
    </div>
  );
}
