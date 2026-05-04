import {
  FamilyMemberDto,
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@/types/domain/families";

export type AdminRuleBlockReason = "NOT_ADMIN" | "LAST_ADMIN";

type AdminRuleResult = {
  allowed: boolean;
  reason?: AdminRuleBlockReason;
};

export function isActiveFamilyMember(status: FamilyMemberStatus) {
  return status === "ACTIVE";
}

export function resolveCurrentUserFamilyMember(
  members: FamilyMemberDto[],
  userId?: string,
) {
  if (!userId) {
    return null;
  }

  return (
    members.find((member) => member.userId === userId) ??
    members.find((member) => member.id === userId) ??
    null
  );
}

export function canManageFamilyAdminActions(input: {
  canEditFamilyAccounts: boolean;
  currentUserMember: FamilyMemberDto | null;
}) {
  return input.canEditFamilyAccounts && input.currentUserMember?.role === "ADMIN";
}

export function countActiveAdmins(members: FamilyMemberDto[]) {
  return members.filter(
    (member) => member.role === "ADMIN" && isActiveFamilyMember(member.status),
  ).length;
}

export function isLastActiveAdmin(member: FamilyMemberDto, members: FamilyMemberDto[]) {
  return (
    member.role === "ADMIN" &&
    isActiveFamilyMember(member.status) &&
    countActiveAdmins(members) <= 1
  );
}

export function canChangeMemberRole(input: {
  canManageAdminActions: boolean;
  targetMember: FamilyMemberDto;
  nextRole: FamilyMemberRole;
  members: FamilyMemberDto[];
}): AdminRuleResult {
  if (!input.canManageAdminActions) {
    return { allowed: false, reason: "NOT_ADMIN" };
  }

  if (
    input.targetMember.role === "ADMIN" &&
    input.nextRole !== "ADMIN" &&
    isLastActiveAdmin(input.targetMember, input.members)
  ) {
    return { allowed: false, reason: "LAST_ADMIN" };
  }

  return { allowed: true };
}

export function canRemoveMember(input: {
  canManageAdminActions: boolean;
  targetMember: FamilyMemberDto;
  members: FamilyMemberDto[];
}): AdminRuleResult {
  if (!input.canManageAdminActions) {
    return { allowed: false, reason: "NOT_ADMIN" };
  }

  if (isLastActiveAdmin(input.targetMember, input.members)) {
    return { allowed: false, reason: "LAST_ADMIN" };
  }

  return { allowed: true };
}
