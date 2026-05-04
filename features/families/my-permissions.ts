import { getCurrentUserFamilyPermissions } from "@/features/families/api";
import { MemberPermissionsDto } from "@/features/families/types";

export type FamilyPermissions = {
  canViewFamilyAccounts: boolean;
  canCreateFamilyAccounts: boolean;
  canEditFamilyAccounts: boolean;
  canDeleteFamilyAccounts: boolean;
  canMarkFamilyAccountsPaid: boolean;
  canManageCategories: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canViewOtherPersonalAccounts: boolean;
  canEditOtherPersonalAccounts: boolean;
};

export type MyFamilyPermissions = FamilyPermissions;

export const defaultMyFamilyPermissions: MyFamilyPermissions = {
  canViewFamilyAccounts: false,
  canCreateFamilyAccounts: false,
  canEditFamilyAccounts: false,
  canDeleteFamilyAccounts: false,
  canMarkFamilyAccountsPaid: false,
  canManageCategories: false,
  canInviteMembers: false,
  canManageMembers: false,
  canViewOtherPersonalAccounts: false,
  canEditOtherPersonalAccounts: false,
};

function normalizeFamilyPermissions(permissions: MemberPermissionsDto): MyFamilyPermissions {
  return {
    canViewFamilyAccounts: Boolean(permissions.canViewFamilyAccounts),
    canCreateFamilyAccounts: Boolean(permissions.canCreateFamilyAccounts),
    canEditFamilyAccounts: Boolean(permissions.canEditFamilyAccounts),
    canDeleteFamilyAccounts: Boolean(permissions.canDeleteFamilyAccounts),
    canMarkFamilyAccountsPaid: Boolean(permissions.canMarkFamilyAccountsPaid),
    canManageCategories: Boolean(permissions.canManageCategories),
    canInviteMembers: Boolean(permissions.canInviteMembers),
    canManageMembers: Boolean(permissions.canManageMembers),
    canViewOtherPersonalAccounts: Boolean(permissions.canViewOtherPersonalAccounts),
    canEditOtherPersonalAccounts: Boolean(permissions.canEditOtherPersonalAccounts),
  };
}

export async function getMyFamilyPermissions(): Promise<MyFamilyPermissions> {
  const permissions = await getCurrentUserFamilyPermissions();
  return normalizeFamilyPermissions(permissions);
}
