export type SessionFlowMode = "private" | "onboarding" | "guest";

export type SessionFlowState = {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isFamilyLoading: boolean;
  familyStatus: "idle" | "loading" | "ready" | "no-family" | "error";
};

export type SessionFlowDecision =
  | { type: "loading" }
  | { type: "allow" }
  | { type: "redirect"; to: string };

export function resolveSessionFlow(
  mode: SessionFlowMode,
  state: SessionFlowState,
): SessionFlowDecision {
  if (state.isAuthLoading || (state.isAuthenticated && state.isFamilyLoading)) {
    return { type: "loading" };
  }

  if (!state.isAuthenticated) {
    if (mode === "guest") {
      return { type: "allow" };
    }

    return { type: "redirect", to: "/auth/login" };
  }

  if (mode === "guest") {
    return {
      type: "redirect",
      to: state.familyStatus === "no-family" ? "/onboarding/family" : "/",
    };
  }

  if (mode === "onboarding") {
    if (state.familyStatus === "no-family") {
      return { type: "allow" };
    }

    return { type: "redirect", to: "/" };
  }

  if (state.familyStatus === "no-family") {
    return { type: "redirect", to: "/onboarding/family" };
  }

  if (state.familyStatus === "ready") {
    return { type: "allow" };
  }

  return { type: "loading" };
}
