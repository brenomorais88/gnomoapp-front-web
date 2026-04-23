import { PermissionCode } from "@/types/domain/permissions";

function toSet(permissions: PermissionCode[]) {
  return new Set(permissions);
}

export function hasPermission(permissions: PermissionCode[], requiredPermission: PermissionCode) {
  if (!requiredPermission) {
    return true;
  }

  return toSet(permissions).has(requiredPermission);
}

export function hasAnyPermission(
  permissions: PermissionCode[],
  requiredPermissions: PermissionCode[],
) {
  if (requiredPermissions.length === 0) {
    return true;
  }

  const grantedPermissions = toSet(permissions);
  return requiredPermissions.some((permission) => grantedPermissions.has(permission));
}

export function hasAllPermissions(
  permissions: PermissionCode[],
  requiredPermissions: PermissionCode[],
) {
  if (requiredPermissions.length === 0) {
    return true;
  }

  const grantedPermissions = toSet(permissions);
  return requiredPermissions.every((permission) => grantedPermissions.has(permission));
}
