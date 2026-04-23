import { AppShell } from "@/components/shared/layout/app-shell";
import { SessionFlowGuard } from "@/components/shared/guards/session-flow-guard";

export default function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionFlowGuard mode="private">
      <AppShell>{children}</AppShell>
    </SessionFlowGuard>
  );
}
