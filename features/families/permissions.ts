import { PermissionCode } from "@/types/domain/permissions";

export const CREATE_PENDING_MEMBER_PERMISSIONS: PermissionCode[] = [
  "families.members.create",
  "family:members:create",
  "FAMILY_MEMBERS_CREATE",
];

export const UPDATE_MEMBER_ROLE_PERMISSIONS: PermissionCode[] = [
  "families.members.role.update",
  "family:members:role:update",
  "FAMILY_MEMBERS_ROLE_UPDATE",
];

export const REMOVE_MEMBER_PERMISSIONS: PermissionCode[] = [
  "families.members.remove",
  "family:members:remove",
  "FAMILY_MEMBERS_REMOVE",
];

export const MANAGE_MEMBER_PERMISSIONS_PERMISSIONS: PermissionCode[] = [
  "families.members.permissions.manage",
  "family:members:permissions:manage",
  "FAMILY_MEMBER_PERMISSIONS_MANAGE",
];
