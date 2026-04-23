export type FamilyId = string;

export type FamilySummaryDto = {
  id: FamilyId;
  name: string;
};

export type FamilyMemberRole = "ADMIN" | "MEMBER";
export type FamilyMemberStatus = "PENDING_REGISTRATION" | "ACTIVE" | "REMOVED";

export type FamilyMemberDto = {
  id: string;
  name: string;
  email?: string;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
};
