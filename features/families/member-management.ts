import { FamilyMemberRole } from "@/types/domain/families";

export function getNextFamilyMemberRole(currentRole: FamilyMemberRole): FamilyMemberRole {
  return currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
}
