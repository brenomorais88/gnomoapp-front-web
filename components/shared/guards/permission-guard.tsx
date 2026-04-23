"use client";

import { ReactNode } from "react";
import { AuthorizationAction } from "@/lib/authorization/actions";
import { PermissionCode } from "@/types/domain/permissions";
import { useAuth } from "@/providers/auth-provider";
import { useAuthorization } from "@/hooks/auth/use-authorization";

type PermissionGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  action?: AuthorizationAction;
  requiredPermission?: PermissionCode;
  requiredAnyPermissions?: PermissionCode[];
  requiredAllPermissions?: PermissionCode[];
};

export function PermissionGuard({
  children,
  fallback = null,
  action,
  requiredPermission,
  requiredAnyPermissions = [],
  requiredAllPermissions = [],
}: PermissionGuardProps) {
  const auth = useAuth();
  const authorization = useAuthorization();

  if (action && !authorization.can(action)) {
    return <>{fallback}</>;
  }

  if (requiredPermission && !auth.hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  if (
    requiredAnyPermissions.length > 0 &&
    !auth.hasAnyPermission(requiredAnyPermissions)
  ) {
    return <>{fallback}</>;
  }

  if (
    requiredAllPermissions.length > 0 &&
    !auth.hasAllPermissions(requiredAllPermissions)
  ) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
