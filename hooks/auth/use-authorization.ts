"use client";

import { useCallback, useMemo } from "react";
import { useMyFamilyMembersQuery } from "@/features/families/hooks";
import { AuthorizationAction } from "@/lib/authorization/actions";
import {
  canExecuteAction,
  getCurrentUserFamilyRole,
  hasFamily,
  isFamilyAdmin,
} from "@/lib/authorization/helpers";
import { useAuth } from "@/providers/auth-provider";
import { useFamily } from "@/providers/family-provider";

export function useAuthorization() {
  const auth = useAuth();
  const family = useFamily();

  const membersQuery = useMyFamilyMembersQuery(auth.isAuthenticated && family.hasFamily);

  const currentRole = useMemo(
    () => getCurrentUserFamilyRole(membersQuery.data, auth.session?.user.id),
    [auth.session?.user.id, membersQuery.data],
  );

  const isAdmin = isFamilyAdmin(currentRole);
  const grantedPermissions = auth.session?.permissions ?? auth.session?.user.permissions ?? [];

  const can = useCallback(
    (action: AuthorizationAction) =>
      canExecuteAction(action, grantedPermissions, { isFamilyAdmin: isAdmin }),
    [grantedPermissions, isAdmin],
  );

  return {
    hasFamily: hasFamily(family.status),
    isFamilyAdmin: isAdmin,
    can,
    canInviteMembers: can("inviteMember"),
    canManageMembers: can("manageMembers"),
    canManageMemberPermissions: can("manageMemberPermissions"),
    canManageCategories: can("manageCategories"),
    canCreateFamilyAccount: can("createFamilyAccount"),
    canEditFamilyAccount: can("editFamilyAccount"),
    canDeleteFamilyAccount: can("deleteFamilyAccount"),
    canMarkFamilyAccountPaid: can("markFamilyAccountPaid"),
    canViewOtherPersonalAccounts: can("viewOtherPersonalAccounts"),
    canEditOtherPersonalAccounts: can("editOtherPersonalAccounts"),
    isLoading: auth.status === "loading" || family.isLoading || membersQuery.isLoading,
  };
}
