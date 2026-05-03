import {
  defaultMyFamilyPermissions,
  MyFamilyPermissions,
} from "@/features/families/my-permissions";

const FAMILY_PERMISSIONS_STORAGE_KEY = "daily-web.my-family-permissions";

export type CachedMyFamilyPermissions = MyFamilyPermissions;

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getStoredMyFamilyPermissions(): CachedMyFamilyPermissions | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(FAMILY_PERMISSIONS_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<CachedMyFamilyPermissions>;
    return {
      ...defaultMyFamilyPermissions,
      canEditFamilyAccounts: Boolean(parsed.canEditFamilyAccounts),
      canViewFamilyAccounts: Boolean(parsed.canViewFamilyAccounts),
      canCreateFamilyAccounts: Boolean(parsed.canCreateFamilyAccounts),
      canDeleteFamilyAccounts: Boolean(parsed.canDeleteFamilyAccounts),
      canMarkFamilyAccountsPaid: Boolean(parsed.canMarkFamilyAccountsPaid),
      canManageCategories: Boolean(parsed.canManageCategories),
      canInviteMembers: Boolean(parsed.canInviteMembers),
      canManageMembers: Boolean(parsed.canManageMembers),
      canViewOtherPersonalAccounts: Boolean(parsed.canViewOtherPersonalAccounts),
      canEditOtherPersonalAccounts: Boolean(parsed.canEditOtherPersonalAccounts),
    };
  } catch {
    return null;
  }
}

export function setStoredMyFamilyPermissions(permissions: CachedMyFamilyPermissions) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(FAMILY_PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
}

export function clearStoredMyFamilyPermissions() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(FAMILY_PERMISSIONS_STORAGE_KEY);
}
