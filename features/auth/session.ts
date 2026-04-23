import { AuthSession } from "@/types/domain/auth";
import { UserSummaryDto } from "@/types/domain/users";

export function buildAuthSession(user: UserSummaryDto): AuthSession {
  return {
    user,
    permissions: user.permissions ?? [],
  };
}

export function withActiveFamilyId(
  session: AuthSession | null,
  familyId: string | null,
): AuthSession | null {
  if (!session) {
    return session;
  }

  return {
    ...session,
    activeFamilyId: familyId ?? undefined,
  };
}
