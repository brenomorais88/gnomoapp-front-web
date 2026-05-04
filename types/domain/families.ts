export type FamilyId = string;

export type FamilySummaryDto = {
  id: FamilyId;
  name: string;
};

export type FamilyMemberRole = "ADMIN" | "MEMBER";
export type FamilyMemberStatus = "PENDING_REGISTRATION" | "ACTIVE" | "REMOVED";

export type FamilyMemberDto = {
  id: string;
  familyMemberId?: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
};
