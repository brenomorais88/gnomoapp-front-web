import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DataTableProps = {
  children: ReactNode;
  className?: string;
};

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-gray-100 bg-card shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm text-foreground">{children}</table>
      </div>
    </div>
  );
}
