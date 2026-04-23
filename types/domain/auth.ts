import { FamilyId, FamilySummaryDto } from "@/types/domain/families";
import { PermissionCode } from "@/types/domain/permissions";
import { UserSummaryDto } from "@/types/domain/users";

export type AuthTokens = {
  accessToken: string;
};

export type AuthSession = {
  user: UserSummaryDto;
  families?: FamilySummaryDto[];
  activeFamilyId?: FamilyId;
  permissions?: PermissionCode[];
};

export type AuthStateStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
