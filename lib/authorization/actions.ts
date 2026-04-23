import { PermissionCode } from "@/types/domain/permissions";

export type AuthorizationAction =
  | "inviteMember"
  | "manageMembers"
  | "manageMemberPermissions"
  | "manageCategories"
  | "createFamilyAccount"
  | "editFamilyAccount"
  | "deleteFamilyAccount"
  | "markFamilyAccountPaid"
  | "viewOtherPersonalAccounts"
  | "editOtherPersonalAccounts";

const authorizationActionPermissionsMap: Record<AuthorizationAction, PermissionCode[]> = {
  inviteMember: ["canInviteMembers", "families.members.create", "family:members:create"],
  manageMembers: ["canManageMembers", "families.members.role.update", "families.members.remove"],
  manageMemberPermissions: [
    "canManageMembers",
    "families.members.permissions.manage",
    "family:members:permissions:manage",
  ],
  manageCategories: ["canManageCategories", "categories.manage", "family:categories:manage"],
  createFamilyAccount: [
    "canCreateFamilyAccounts",
    "family.accounts.create",
    "accounts.family.create",
  ],
  editFamilyAccount: ["canEditFamilyAccounts", "family.accounts.edit", "accounts.family.edit"],
  deleteFamilyAccount: [
    "canDeleteFamilyAccounts",
    "family.accounts.delete",
    "accounts.family.delete",
  ],
  markFamilyAccountPaid: [
    "canMarkFamilyAccountsPaid",
    "family.accounts.mark-paid",
    "accounts.family.mark-paid",
  ],
  viewOtherPersonalAccounts: [
    "canViewOtherPersonalAccounts",
    "accounts.personal.other.view",
  ],
  editOtherPersonalAccounts: [
    "canEditOtherPersonalAccounts",
    "accounts.personal.other.edit",
  ],
};

export function getPermissionsForAction(action: AuthorizationAction) {
  return authorizationActionPermissionsMap[action];
}
