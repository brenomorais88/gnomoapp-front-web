import { PermissionCode } from "@/types/domain/permissions";

export type UserId = string;

export type UserSummaryDto = {
  id: UserId;
  email: string;
  name: string;
  permissions?: PermissionCode[];
};
