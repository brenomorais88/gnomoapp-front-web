export const appShellSpacing = "px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export const statusToneClassMap: Record<StatusTone, string> = {
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-primary/10 text-primary border-primary/30",
  neutral: "bg-muted text-muted-foreground border-border",
};
