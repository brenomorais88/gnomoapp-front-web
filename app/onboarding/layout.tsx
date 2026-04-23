import { SessionFlowGuard } from "@/components/shared/guards/session-flow-guard";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SessionFlowGuard mode="onboarding">{children}</SessionFlowGuard>;
}
