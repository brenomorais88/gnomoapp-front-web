import { FamilyMemberRole, FamilyMemberDto } from "@/types/domain/families";
import { PermissionCode } from "@/types/domain/permissions";
import {
  AuthorizationAction,
  getPermissionsForAction,
} from "@/lib/authorization/actions";

export function hasFamily(status: "ready" | "idle" | "loading" | "no-family" | "error") {
  return status === "ready";
}

export function isFamilyAdmin(role?: FamilyMemberRole | null) {
  return role === "ADMIN";
}

export function getCurrentUserFamilyRole(
  members: FamilyMemberDto[] | undefined,
  userId: string | undefined,
) {
  if (!members || !userId) {
    return undefined;
  }

  const currentMember = members.find((member) => member.id === userId);
  return currentMember?.role;
}

export function canExecuteAction(
  action: AuthorizationAction,
  grantedPermissions: PermissionCode[],
  options?: { isFamilyAdmin?: boolean },
) {
  if (options?.isFamilyAdmin) {
    return true;
  }

  const requiredPermissions = getPermissionsForAction(action);
  const granted = new Set(grantedPermissions);
  return requiredPermissions.some((permission) => granted.has(permission));
}
