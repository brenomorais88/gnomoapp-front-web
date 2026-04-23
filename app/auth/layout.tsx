import { SessionFlowGuard } from "@/components/shared/guards/session-flow-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SessionFlowGuard mode="guest">{children}</SessionFlowGuard>;
}
