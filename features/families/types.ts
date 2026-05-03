import { FamilyMemberDto, FamilySummaryDto } from "@/types/domain/families";

export type CreateFamilyInput = {
  name: string;
};

export type CreateFamilyResponse = FamilySummaryDto;

export type FamilyMembersResponse = FamilyMemberDto[];

export type CreatePendingFamilyMemberInput = {
  displayName: string;
  document?: string;
  email?: string;
  phone?: string;
};

export type CreatePendingFamilyMemberResponse = FamilyMemberDto;

export type UpdateFamilyMemberRoleInput = {
  memberId: string;
  role: "ADMIN" | "MEMBER";
};

export type RemoveFamilyMemberInput = {
  memberId: string;
};

export type MemberPermissionsDto = {
  [key: string]: boolean;
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

export type UpdateMemberPermissionsInput = {
  memberId: string;
  permissions: MemberPermissionsDto;
};
